import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { ContractorsModule } from './contractors/contractors.module';
import { PackagesModule } from './packages/packages.module';
import { DocumentsModule } from './documents/documents.module';
import { CountiesModule } from './counties/counties.module';
import { PdfModule } from './pdf/pdf.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { WebSocketModule } from './websocket/websocket.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Caching
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // 5 minutes
    }),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    CustomersModule,
    ContractorsModule,
    PackagesModule,
    DocumentsModule,
    CountiesModule,
    PdfModule,
    FileStorageModule,
    WebSocketModule,
    EmailModule,
  ],
})
export class AppModule {}
