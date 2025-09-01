import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PermitType } from '@prisma/client';

export class CreateCountyTemplateItemDto {
  @ApiProperty({ example: 'Building Permit Application' })
  @IsString()
  label: string;

  @ApiProperty({ example: 'Application' })
  @IsString()
  category: string;

  @ApiProperty({ enum: PermitType, example: PermitType.RESIDENTIAL })
  @IsOptional()
  @IsEnum(PermitType)
  permitType?: PermitType;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  sort?: number;
}
