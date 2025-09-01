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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('packages')
@Controller('packages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new permit package' })
  @ApiResponse({ status: 201, description: 'Package created successfully' })
  create(@Body() createPackageDto: CreatePackageDto, @Request() req) {
    return this.packagesService.create(createPackageDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all packages with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Packages retrieved successfully' })
  findAll(@Query() query: {
    search?: string;
    status?: string;
    permitType?: string;
    countyId?: string;
    customerId?: string;
    contractorId?: string;
    page?: number;
    limit?: number;
  }) {
    return this.packagesService.findAll(query as any);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  getDashboardStats() {
    return this.packagesService.getDashboardStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a package by ID' })
  @ApiResponse({ status: 200, description: 'Package retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a package' })
  @ApiResponse({ status: 200, description: 'Package updated successfully' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto, @Request() req) {
    return this.packagesService.update(id, updatePackageDto, req.user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update package status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; note?: string },
    @Request() req,
  ) {
    return this.packagesService.updateStatus(id, body.status as any, req.user.id, body.note);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a package' })
  @ApiResponse({ status: 200, description: 'Package deleted successfully' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  remove(@Param('id') id: string) {
    return this.packagesService.remove(id);
  }

  @Get(':id/checklist')
  @ApiOperation({ summary: 'Get package checklist items' })
  @ApiResponse({ status: 200, description: 'Checklist items retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  getChecklistItems(@Param('id') id: string) {
    return this.packagesService.getChecklistItems(id);
  }

  @Patch('checklist/:itemId')
  @ApiOperation({ summary: 'Update checklist item' })
  @ApiResponse({ status: 200, description: 'Checklist item updated successfully' })
  @ApiResponse({ status: 404, description: 'Checklist item not found' })
  updateChecklistItem(
    @Param('itemId') itemId: string,
    @Body() body: { completed: boolean; notes?: string },
  ) {
    return this.packagesService.updateChecklistItem(itemId, body.completed, body.notes);
  }

  @Post(':id/checklist')
  @ApiOperation({ summary: 'Create checklist items from template' })
  @ApiResponse({ status: 201, description: 'Checklist items created successfully' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  createChecklistItems(
    @Param('id') id: string,
    @Body() body: { templateItems: any[] },
  ) {
    return this.packagesService.createChecklistItems(id, body.templateItems);
  }
}
