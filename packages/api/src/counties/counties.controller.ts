import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CountiesService } from './counties.service';
import { CreateCountyTemplateItemDto } from './dto/create-county-template-item.dto';
import { UpdateCountyTemplateItemDto } from './dto/update-county-template-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('counties')
@Controller('counties')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CountiesController {
  constructor(private readonly countiesService: CountiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all counties' })
  @ApiResponse({ status: 200, description: 'Counties retrieved successfully' })
  findAll() {
    return this.countiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a county by ID' })
  @ApiResponse({ status: 200, description: 'County retrieved successfully' })
  @ApiResponse({ status: 404, description: 'County not found' })
  findOne(@Param('id') id: string) {
    return this.countiesService.findOne(id);
  }

  @Get(':id/templates')
  @ApiOperation({ summary: 'Get county checklist templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  @ApiResponse({ status: 404, description: 'County not found' })
  getCountyTemplates(@Param('id') id: string) {
    return this.countiesService.getCountyTemplates(id);
  }

  @Post(':id/templates')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a county checklist template item' })
  @ApiResponse({ status: 201, description: 'Template item created successfully' })
  @ApiResponse({ status: 404, description: 'County not found' })
  createCountyTemplate(
    @Param('id') id: string,
    @Body() createTemplateDto: CreateCountyTemplateItemDto,
  ) {
    return this.countiesService.createCountyTemplate(id, createTemplateDto);
  }

  @Patch(':id/templates/:itemId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a county checklist template item' })
  @ApiResponse({ status: 200, description: 'Template item updated successfully' })
  @ApiResponse({ status: 404, description: 'Template item not found' })
  updateCountyTemplate(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() updateTemplateDto: UpdateCountyTemplateItemDto,
  ) {
    return this.countiesService.updateCountyTemplate(id, itemId, updateTemplateDto);
  }

  @Delete(':id/templates/:itemId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a county checklist template item' })
  @ApiResponse({ status: 200, description: 'Template item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template item not found' })
  deleteCountyTemplate(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.countiesService.deleteCountyTemplate(id, itemId);
  }
}
