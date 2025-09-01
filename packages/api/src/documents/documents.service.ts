import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileStorageService } from '../file-storage/file-storage.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentType } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async create(createDocumentDto: CreateDocumentDto, file: Express.Multer.File) {
    // Upload file to MinIO
    const uploadResult = await this.fileStorageService.uploadFile(file, 'documents');

    const document = await this.prisma.document.create({
      data: {
        filename: uploadResult.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        type: createDocumentDto.type,
        tags: createDocumentDto.tags || [],
        packageId: createDocumentDto.packageId,
      },
      include: {
        package: {
          include: {
            customer: true,
            contractor: true,
            county: true,
          },
        },
        pdfFieldMaps: true,
      },
    });

    return document;
  }

  async findAll(query: {
    packageId?: string;
    type?: DocumentType;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { packageId, type, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (packageId) where.packageId = packageId;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' as any } },
        { tags: { hasSome: [search] } },
      ];
    }

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        include: {
          package: {
            include: {
              customer: true,
              contractor: true,
              county: true,
            },
          },
          pdfFieldMaps: true,
        },
        skip,
        take: limit,
        orderBy: { uploadedAt: 'desc' },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data: documents,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        package: {
          include: {
            customer: true,
            contractor: true,
            county: true,
          },
        },
        pdfFieldMaps: true,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const updatedDocument = await this.prisma.document.update({
      where: { id },
      data: updateDocumentDto,
      include: {
        package: {
          include: {
            customer: true,
            contractor: true,
            county: true,
          },
        },
        pdfFieldMaps: true,
      },
    });

    return updatedDocument;
  }

  async remove(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Delete file from MinIO
    try {
      await this.fileStorageService.deleteFile(document.filename);
    } catch (error) {
      // Log error but continue with database deletion
      console.error('Failed to delete file from storage:', error);
    }

    // Delete from database
    await this.prisma.document.delete({
      where: { id },
    });

    return { message: 'Document deleted successfully' };
  }

  async getPresignedUrl(id: string, expirySeconds: number = 3600) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const url = await this.fileStorageService.getPresignedUrl(
      document.filename,
      'GET',
      expirySeconds,
    );

    return {
      url,
      filename: document.originalName,
      mimeType: document.mimeType,
      size: document.size,
    };
  }

  async getPresignedUrlForUpload(filename: string, expirySeconds: number = 3600) {
    const url = await this.fileStorageService.getPresignedUrl(
      filename,
      'PUT',
      expirySeconds,
    );

    return { url };
  }

  async createPdfFieldMap(documentId: string, fieldMapData: any) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const fieldMap = await this.prisma.pdfFieldMap.create({
      data: {
        ...fieldMapData,
        documentId,
      },
    });

    return fieldMap;
  }

  async updatePdfFieldMap(fieldMapId: string, fieldMapData: any) {
    const fieldMap = await this.prisma.pdfFieldMap.findUnique({
      where: { id: fieldMapId },
    });

    if (!fieldMap) {
      throw new NotFoundException('PDF field map not found');
    }

    const updatedFieldMap = await this.prisma.pdfFieldMap.update({
      where: { id: fieldMapId },
      data: fieldMapData,
    });

    return updatedFieldMap;
  }

  async deletePdfFieldMap(fieldMapId: string) {
    const fieldMap = await this.prisma.pdfFieldMap.findUnique({
      where: { id: fieldMapId },
    });

    if (!fieldMap) {
      throw new NotFoundException('PDF field map not found');
    }

    await this.prisma.pdfFieldMap.delete({
      where: { id: fieldMapId },
    });

    return { message: 'PDF field map deleted successfully' };
  }
}
