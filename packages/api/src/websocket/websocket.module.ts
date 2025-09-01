import { Module } from '@nestjs/common';
import { PermitWebSocketGateway } from './websocket.gateway';

@Module({
  providers: [PermitWebSocketGateway],
  exports: [PermitWebSocketGateway],
})
export class WebSocketModule {}
