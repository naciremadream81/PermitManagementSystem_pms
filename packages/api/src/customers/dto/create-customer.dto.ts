import { IsString, IsEmail, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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

export class CreateCustomerDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '(305) 555-0123' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}
