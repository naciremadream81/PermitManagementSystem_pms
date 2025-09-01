import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('pdf')
@Controller('pdf')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('fill')
  @ApiOperation({ summary: 'Fill PDF with form data' })
  @ApiResponse({ status: 201, description: 'PDF filled successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  fillPdf(@Body() body: { documentId: string; formData: Record<string, any> }) {
    return this.pdfService.fillPdf(body.documentId, body.formData);
  }

  @Post('extract-fields')
  @ApiOperation({ summary: 'Extract form fields from PDF' })
  @ApiResponse({ status: 200, description: 'Fields extracted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  extractFormFields(@Body() body: { documentId: string }) {
    return this.pdfService.extractFormFields(body.documentId);
  }

  @Post('field-maps')
  @ApiOperation({ summary: 'Create field maps for PDF' })
  @ApiResponse({ status: 201, description: 'Field maps created successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  createFieldMap(@Body() body: { documentId: string; fieldMaps: any[] }) {
    return this.pdfService.createFieldMap(body.documentId, body.fieldMaps);
  }
}
