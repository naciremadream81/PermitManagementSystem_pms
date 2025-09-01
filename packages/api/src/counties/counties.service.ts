import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCountyTemplateItemDto } from './dto/create-county-template-item.dto';
import { UpdateCountyTemplateItemDto } from './dto/update-county-template-item.dto';

@Injectable()
export class CountiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.county.findMany({
      include: {
        _count: {
          select: {
            packages: true,
            checklistTemplateItems: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const county = await this.prisma.county.findUnique({
      where: { id },
      include: {
        packages: {
          include: {
            customer: true,
            contractor: true,
            address: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        checklistTemplateItems: {
          orderBy: { sort: 'asc' },
        },
        _count: {
          select: {
            packages: true,
            checklistTemplateItems: true,
          },
        },
      },
    });

    if (!county) {
      throw new NotFoundException('County not found');
    }

    return county;
  }

  async getCountyTemplates(countyId: string) {
    const county = await this.prisma.county.findUnique({
      where: { id: countyId },
      include: {
        checklistTemplateItems: {
          orderBy: { sort: 'asc' },
        },
      },
    });

    if (!county) {
      throw new NotFoundException('County not found');
    }

    return county.checklistTemplateItems;
  }

  async createCountyTemplate(countyId: string, createTemplateDto: CreateCountyTemplateItemDto) {
    const county = await this.prisma.county.findUnique({
      where: { id: countyId },
    });

    if (!county) {
      throw new NotFoundException('County not found');
    }

    const templateItem = await this.prisma.countyChecklistTemplateItem.create({
      data: {
        ...createTemplateDto,
        countyId,
      },
    });

    return templateItem;
  }

  async updateCountyTemplate(
    countyId: string,
    itemId: string,
    updateTemplateDto: UpdateCountyTemplateItemDto,
  ) {
    const templateItem = await this.prisma.countyChecklistTemplateItem.findFirst({
      where: {
        id: itemId,
        countyId,
      },
    });

    if (!templateItem) {
      throw new NotFoundException('Template item not found');
    }

    const updatedItem = await this.prisma.countyChecklistTemplateItem.update({
      where: { id: itemId },
      data: updateTemplateDto,
    });

    return updatedItem;
  }

  async deleteCountyTemplate(countyId: string, itemId: string) {
    const templateItem = await this.prisma.countyChecklistTemplateItem.findFirst({
      where: {
        id: itemId,
        countyId,
      },
    });

    if (!templateItem) {
      throw new NotFoundException('Template item not found');
    }

    await this.prisma.countyChecklistTemplateItem.delete({
      where: { id: itemId },
    });

    return { message: 'Template item deleted successfully' };
  }
}
