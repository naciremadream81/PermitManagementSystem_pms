import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileStorageService } from '../file-storage/file-storage.service';
import { PDFDocument, PDFForm, PDFTextField, PDFCheckBox } from 'pdf-lib';

@Injectable()
export class PdfService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async fillPdf(documentId: string, formData: Record<string, any>) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { pdfFieldMaps: true },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.mimeType !== 'application/pdf') {
      throw new Error('Document is not a PDF');
    }

    // Get the PDF file from MinIO
    const pdfBuffer = await this.getPdfBuffer(document.filename);

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const form = pdfDoc.getForm();

    // Fill form fields based on field maps
    for (const fieldMap of document.pdfFieldMaps) {
      const fieldName = fieldMap.fieldName;
      const value = formData[fieldName];

      if (value !== undefined) {
        try {
          const field = form.getField(fieldName);
          
          if (field instanceof PDFTextField) {
            field.setText(String(value));
          } else if (field instanceof PDFCheckBox) {
            if (value === true || value === 'true' || value === '1') {
              field.check();
            } else {
              field.uncheck();
            }
          }
        } catch (error) {
          console.warn(`Failed to fill field ${fieldName}:`, error.message);
        }
      }
    }

    // Save the filled PDF
    const filledPdfBytes = await pdfDoc.save();

    // Upload the filled PDF
    const filename = `filled_${document.filename}`;
    await this.fileStorageService.uploadBuffer(filename, Buffer.from(filledPdfBytes), 'application/pdf');

    // Create a new document record for the filled PDF
    const filledDocument = await this.prisma.document.create({
      data: {
        filename,
        originalName: `filled_${document.originalName}`,
        mimeType: 'application/pdf',
        size: filledPdfBytes.length,
        type: document.type,
        tags: [...document.tags, 'filled'],
        packageId: document.packageId,
      },
      include: {
        package: {
          include: {
            customer: true,
            contractor: true,
            county: true,
          },
        },
      },
    });

    return filledDocument;
  }

  async extractFormFields(documentId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.mimeType !== 'application/pdf') {
      throw new Error('Document is not a PDF');
    }

    // Get the PDF file from MinIO
    const pdfBuffer = await this.getPdfBuffer(document.filename);

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const form = pdfDoc.getForm();

    const fields = form.getFields();
    const fieldInfo = [];

    for (const field of fields) {
      const fieldName = field.getName();
      const fieldType = field.constructor.name;
      
      // Get field bounds if available
      let bounds = null;
      try {
        // Note: getRectangle() method may not be available in all PDF-lib versions
        // bounds = field.acroField.getRectangle();
      } catch (error) {
        // Field bounds not available
      }

      fieldInfo.push({
        name: fieldName,
        type: fieldType,
        bounds,
      });
    }

    return fieldInfo;
  }

  async createFieldMap(documentId: string, fieldMaps: Array<{
    fieldName: string;
    fieldType: string;
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
  }>) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Delete existing field maps
    await this.prisma.pdfFieldMap.deleteMany({
      where: { documentId },
    });

    // Create new field maps
    const createdFieldMaps = await Promise.all(
      fieldMaps.map(fieldMap =>
        this.prisma.pdfFieldMap.create({
          data: {
            ...fieldMap,
            documentId,
          },
        })
      )
    );

    return createdFieldMaps;
  }

  private async getPdfBuffer(filename: string): Promise<Buffer> {
    return this.fileStorageService.getFileBuffer(filename);
  }
}
