import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a document' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(pdf|doc|docx|jpg|jpeg|png)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.documentsService.create(createDocumentDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents with filtering' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  findAll(@Query() query: {
    packageId?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return this.documentsService.findAll(query as any);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a document by ID' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Get(':id/url')
  @ApiOperation({ summary: 'Get presigned URL for document download' })
  @ApiResponse({ status: 200, description: 'URL generated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  getPresignedUrl(@Param('id') id: string, @Query('expiry') expiry?: string) {
    const expirySeconds = expiry ? parseInt(expiry) : 3600;
    return this.documentsService.getPresignedUrl(id, expirySeconds);
  }

  @Post('presigned-url')
  @ApiOperation({ summary: 'Get presigned URL for file upload' })
  @ApiResponse({ status: 200, description: 'URL generated successfully' })
  getPresignedUrlForUpload(@Body() body: { filename: string; expiry?: number }) {
    const expirySeconds = body.expiry || 3600;
    return this.documentsService.getPresignedUrlForUpload(body.filename, expirySeconds);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document metadata' })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    return this.documentsService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }

  @Post(':id/field-maps')
  @ApiOperation({ summary: 'Create PDF field map' })
  @ApiResponse({ status: 201, description: 'Field map created successfully' })
  createPdfFieldMap(@Param('id') id: string, @Body() fieldMapData: any) {
    return this.documentsService.createPdfFieldMap(id, fieldMapData);
  }

  @Patch('field-maps/:fieldMapId')
  @ApiOperation({ summary: 'Update PDF field map' })
  @ApiResponse({ status: 200, description: 'Field map updated successfully' })
  updatePdfFieldMap(@Param('fieldMapId') fieldMapId: string, @Body() fieldMapData: any) {
    return this.documentsService.updatePdfFieldMap(fieldMapId, fieldMapData);
  }

  @Delete('field-maps/:fieldMapId')
  @ApiOperation({ summary: 'Delete PDF field map' })
  @ApiResponse({ status: 200, description: 'Field map deleted successfully' })
  deletePdfFieldMap(@Param('fieldMapId') fieldMapId: string) {
    return this.documentsService.deletePdfFieldMap(fieldMapId);
  }
}
