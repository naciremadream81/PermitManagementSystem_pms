import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.configService.get('MINIO_PORT', '9000')),
      useSSL: this.configService.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get('MINIO_SECRET_KEY', 'minioadmin'),
    });

    this.bucketName = this.configService.get('MINIO_BUCKET', 'permit-documents');
    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket '${this.bucketName}' created successfully`);
      }
    } catch (error) {
      this.logger.error(`Failed to initialize bucket: ${error.message}`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<{ filename: string; url: string }> {
    const fileExtension = file.originalname.split('.').pop();
    const filename = `${folder}/${uuidv4()}.${fileExtension}`;

    try {
      await this.minioClient.putObject(
        this.bucketName,
        filename,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );

      const url = await this.getPresignedUrl(filename, 'GET', 24 * 60 * 60); // 24 hours

      return {
        filename,
        url,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new Error('Failed to upload file');
    }
  }

  async getPresignedUrl(
    filename: string,
    method: 'GET' | 'PUT' | 'POST' = 'GET',
    expirySeconds: number = 3600,
  ): Promise<string> {
    try {
      const url = await this.minioClient.presignedUrl(
        method,
        this.bucketName,
        filename,
        expirySeconds,
      );
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${error.message}`);
      throw new Error('Failed to generate presigned URL');
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, filename);
      this.logger.log(`File '${filename}' deleted successfully`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new Error('Failed to delete file');
    }
  }

  async fileExists(filename: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucketName, filename);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getFileInfo(filename: string): Promise<Minio.BucketItemStat> {
    try {
      return await this.minioClient.statObject(this.bucketName, filename);
    } catch (error) {
      this.logger.error(`Failed to get file info: ${error.message}`);
      throw new Error('File not found');
    }
  }

  async uploadBuffer(filename: string, buffer: Buffer, contentType: string): Promise<{ filename: string; url: string }> {
    try {
      await this.minioClient.putObject(
        this.bucketName,
        filename,
        buffer,
        buffer.length,
        {
          'Content-Type': contentType,
        },
      );

      const url = await this.getPresignedUrl(filename, 'GET', 24 * 60 * 60); // 24 hours

      return {
        filename,
        url,
      };
    } catch (error) {
      this.logger.error(`Failed to upload buffer: ${error.message}`);
      throw new Error('Failed to upload buffer');
    }
  }

  async getFileBuffer(filename: string): Promise<Buffer> {
    try {
      const stream = await this.minioClient.getObject(this.bucketName, filename);
      const chunks: Buffer[] = [];
      
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Failed to get file buffer: ${error.message}`);
      throw new Error('Failed to get file buffer');
    }
  }
}
