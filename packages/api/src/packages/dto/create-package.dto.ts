import { IsString, IsOptional, IsEnum, IsDateString, ValidateNested, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PermitType } from '@prisma/client';

class AddressDto {
  @ApiProperty({ example: '123 Main St' })
  @IsString()
  street: string;

  @ApiProperty({ example: 'Miami' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'FL' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '33101' })
  @IsString()
  zipCode: string;

  @ApiProperty({ example: 'Miami-Dade' })
  @IsOptional()
  @IsString()
  county?: string;
}

class MobileHomeDetailsDto {
  @ApiProperty({ example: 'Clayton Homes' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ example: 'Double Wide' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ example: 'MH123456789' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiProperty({ example: 2020 })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiProperty({ example: 14.0 })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiProperty({ example: 60.0 })
  @IsOptional()
  @IsNumber()
  length?: number;

  @ApiProperty({ example: 840.0 })
  @IsOptional()
  @IsNumber()
  squareFootage?: number;
}

export class CreatePackageDto {
  @ApiProperty({ enum: PermitType, example: PermitType.RESIDENTIAL })
  @IsEnum(PermitType)
  permitType: PermitType;

  @ApiProperty({ example: 'New residential construction' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ example: 'customer-id' })
  @IsString()
  customerId: string;

  @ApiProperty({ example: 'contractor-id' })
  @IsOptional()
  @IsString()
  contractorId?: string;

  @ApiProperty({ example: 'county-id' })
  @IsString()
  countyId: string;

  @ApiProperty({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiProperty({ type: MobileHomeDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MobileHomeDetailsDto)
  mobileHomeDetails?: MobileHomeDetailsDto;
}
