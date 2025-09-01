import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';

export class CreateDocumentDto {
  @ApiProperty({ enum: DocumentType, example: DocumentType.APPLICATION })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty({ example: 'document-id' })
  @IsString()
  packageId: string;

  @ApiProperty({ example: ['important', 'contract'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
