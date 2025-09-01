import {
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { WebSocketGateway } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class PermitWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Check for token in auth object first (Socket.IO client sends it this way)
      const token = client.handshake.auth.token || 
                   client.handshake.auth.authorization ||
                   client.handshake.headers.authorization;
      
      if (!token) {
        this.logger.warn('No token provided for WebSocket connection');
        client.disconnect();
        return;
      }

      // Remove 'Bearer ' prefix if present
      const cleanToken = token.replace('Bearer ', '');
      
      const payload = this.jwtService.verify(cleanToken);
      client.userId = payload.sub;
      client.userRole = payload.role;

      this.connectedUsers.set(payload.sub, client.id);
      this.logger.log(`Client connected: ${payload.sub} (${payload.email})`);
    } catch (error) {
      this.logger.error(`WebSocket authentication failed: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      this.logger.log(`Client disconnected: ${client.userId}`);
    }
  }

  @SubscribeMessage('join-package')
  async handleJoinPackage(
    @MessageBody() data: { packageId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      // Verify user has access to this package
      const packageExists = await this.prisma.permitPackage.findFirst({
        where: {
          id: data.packageId,
          OR: [
            { createdById: client.userId },
            { updatedById: client.userId },
          ],
        },
      });

      if (!packageExists) {
        client.emit('error', { message: 'Access denied to this package' });
        return;
      }

      client.join(`package-${data.packageId}`);
      client.emit('joined-package', { packageId: data.packageId });

      // Notify others in the room
      client.to(`package-${data.packageId}`).emit('presence', {
        userId: client.userId,
        action: 'joined',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error joining package: ${error.message}`);
      client.emit('error', { message: 'Failed to join package' });
    }
  }

  @SubscribeMessage('leave-package')
  handleLeavePackage(
    @MessageBody() data: { packageId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.leave(`package-${data.packageId}`);
    client.emit('left-package', { packageId: data.packageId });

    // Notify others in the room
    client.to(`package-${data.packageId}`).emit('presence', {
      userId: client.userId,
      action: 'left',
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('toggle-checklist-item')
  async handleToggleChecklistItem(
    @MessageBody() data: { packageId: string; itemId: string; completed: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      // Update the checklist item
      const updatedItem = await this.prisma.packageChecklistItem.update({
        where: { id: data.itemId },
        data: {
          completed: data.completed,
          completedAt: data.completed ? new Date() : null,
        },
      });

      // Broadcast to all users in the package room
      this.server.to(`package-${data.packageId}`).emit('checklist-updated', {
        itemId: data.itemId,
        completed: data.completed,
        updatedBy: client.userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error updating checklist item: ${error.message}`);
      client.emit('error', { message: 'Failed to update checklist item' });
    }
  }

  @SubscribeMessage('update-status')
  async handleUpdateStatus(
    @MessageBody() data: { packageId: string; status: string; note?: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      // Update the package status
      const updatedPackage = await this.prisma.permitPackage.update({
        where: { id: data.packageId },
        data: {
          status: data.status as any,
          updatedById: client.userId,
        },
      });

      // Create status log
      await this.prisma.statusLog.create({
        data: {
          packageId: data.packageId,
          userId: client.userId,
          status: data.status as any,
          note: data.note,
        },
      });

      // Broadcast to all users in the package room
      this.server.to(`package-${data.packageId}`).emit('status-updated', {
        packageId: data.packageId,
        status: data.status,
        note: data.note,
        updatedBy: client.userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error updating status: ${error.message}`);
      client.emit('error', { message: 'Failed to update status' });
    }
  }

  // Method to emit events from other parts of the application
  emitToPackage(packageId: string, event: string, data: any) {
    this.server.to(`package-${packageId}`).emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
}
