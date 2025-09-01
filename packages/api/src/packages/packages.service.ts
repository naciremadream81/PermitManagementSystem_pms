import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PackageStatus, PermitType } from '@prisma/client';

@Injectable()
export class PackagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPackageDto: CreatePackageDto, userId: string) {
    // Generate unique package number
    const packageNumber = await this.generatePackageNumber();

    const packageData = await this.prisma.permitPackage.create({
      data: {
        ...createPackageDto,
        packageNumber,
        createdById: userId,
        address: createPackageDto.address
          ? {
              create: {
                street: createPackageDto.address.street,
                city: createPackageDto.address.city,
                state: createPackageDto.address.state || 'FL',
                zipCode: createPackageDto.address.zipCode,
                county: createPackageDto.address.county,
              },
            }
          : undefined,
        mobileHomeDetails: createPackageDto.mobileHomeDetails
          ? {
              create: createPackageDto.mobileHomeDetails,
            }
          : undefined,
      } as any,
      include: {
        customer: true,
        contractor: true,
        county: true,
        address: true,
        mobileHomeDetails: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        checklistItems: true,
        documents: true,
        statusLogs: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            checklistItems: true,
            documents: true,
            statusLogs: true,
          },
        },
      },
    });

    // Create initial status log
    await this.prisma.statusLog.create({
      data: {
        packageId: packageData.id,
        userId,
        status: PackageStatus.DRAFT,
        note: 'Package created',
      },
    });

    return packageData;
  }

  async findAll(query: {
    search?: string;
    status?: PackageStatus;
    permitType?: PermitType;
    countyId?: string;
    customerId?: string;
    contractorId?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, status, permitType, countyId, customerId, contractorId, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { packageNumber: { contains: search, mode: 'insensitive' as any } },
        { description: { contains: search, mode: 'insensitive' as any } },
        { customer: { 
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as any } },
            { lastName: { contains: search, mode: 'insensitive' as any } },
          ]
        }},
        { contractor: { companyName: { contains: search, mode: 'insensitive' as any } }},
      ];
    }

    if (status) where.status = status;
    if (permitType) where.permitType = permitType;
    if (countyId) where.countyId = countyId;
    if (customerId) where.customerId = customerId;
    if (contractorId) where.contractorId = contractorId;

    const [packages, total] = await Promise.all([
      this.prisma.permitPackage.findMany({
        where,
        include: {
          customer: {
            include: { address: true },
          },
          contractor: {
            include: { address: true },
          },
          county: true,
          address: true,
          mobileHomeDetails: true,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          updatedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              checklistItems: true,
              documents: true,
              statusLogs: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.permitPackage.count({ where }),
    ]);

    return {
      data: packages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const packageData = await this.prisma.permitPackage.findUnique({
      where: { id },
      include: {
        customer: {
          include: { address: true },
        },
        contractor: {
          include: { address: true },
        },
        county: true,
        address: true,
        mobileHomeDetails: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        checklistItems: {
          orderBy: { sort: 'asc' },
        },
        documents: {
          include: {
            pdfFieldMaps: true,
          },
          orderBy: { uploadedAt: 'desc' },
        },
        statusLogs: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        signatures: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { signedAt: 'desc' },
        },
        _count: {
          select: {
            checklistItems: true,
            documents: true,
            statusLogs: true,
            signatures: true,
          },
        },
      },
    });

    if (!packageData) {
      throw new NotFoundException('Permit package not found');
    }

    return packageData;
  }

  async update(id: string, updatePackageDto: UpdatePackageDto, userId: string) {
    const packageData = await this.prisma.permitPackage.findUnique({
      where: { id },
      include: { address: true, mobileHomeDetails: true },
    });

    if (!packageData) {
      throw new NotFoundException('Permit package not found');
    }

    const updatedPackage = await this.prisma.permitPackage.update({
      where: { id },
      data: {
        ...updatePackageDto,
        updatedById: userId,
        address: updatePackageDto.address
          ? {
              upsert: {
                create: {
                  street: updatePackageDto.address.street,
                  city: updatePackageDto.address.city,
                  state: updatePackageDto.address.state || 'FL',
                  zipCode: updatePackageDto.address.zipCode,
                  county: updatePackageDto.address.county,
                },
                update: {
                  street: updatePackageDto.address.street,
                  city: updatePackageDto.address.city,
                  state: updatePackageDto.address.state || 'FL',
                  zipCode: updatePackageDto.address.zipCode,
                  county: updatePackageDto.address.county,
                },
              },
            }
          : undefined,
        mobileHomeDetails: updatePackageDto.mobileHomeDetails
          ? {
              upsert: {
                create: updatePackageDto.mobileHomeDetails,
                update: updatePackageDto.mobileHomeDetails,
              },
            }
          : undefined,
      } as any,
      include: {
        customer: {
          include: { address: true },
        },
        contractor: {
          include: { address: true },
        },
        county: true,
        address: true,
        mobileHomeDetails: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        checklistItems: {
          orderBy: { sort: 'asc' },
        },
        documents: {
          include: {
            pdfFieldMaps: true,
          },
          orderBy: { uploadedAt: 'desc' },
        },
        statusLogs: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            checklistItems: true,
            documents: true,
            statusLogs: true,
          },
        },
      },
    });

    return updatedPackage;
  }

  async remove(id: string) {
    const packageData = await this.prisma.permitPackage.findUnique({
      where: { id },
    });

    if (!packageData) {
      throw new NotFoundException('Permit package not found');
    }

    await this.prisma.permitPackage.delete({
      where: { id },
    });

    return { message: 'Permit package deleted successfully' };
  }

  async updateStatus(id: string, status: PackageStatus, userId: string, note?: string) {
    const packageData = await this.prisma.permitPackage.findUnique({
      where: { id },
    });

    if (!packageData) {
      throw new NotFoundException('Permit package not found');
    }

    const [updatedPackage, statusLog] = await Promise.all([
      this.prisma.permitPackage.update({
        where: { id },
        data: {
          status,
          updatedById: userId,
        },
        include: {
          customer: true,
          contractor: true,
          county: true,
        },
      }),
      this.prisma.statusLog.create({
        data: {
          packageId: id,
          userId,
          status,
          note,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    return {
      package: updatedPackage,
      statusLog,
    };
  }

  async getDashboardStats() {
    const [
      totalPackages,
      pendingPackages,
      approvedPackages,
      overduePackages,
      recentPackages,
    ] = await Promise.all([
      this.prisma.permitPackage.count(),
      this.prisma.permitPackage.count({
        where: {
          status: {
            in: [PackageStatus.DRAFT, PackageStatus.SUBMITTED, PackageStatus.UNDER_REVIEW],
          },
        },
      }),
      this.prisma.permitPackage.count({
        where: { status: PackageStatus.APPROVED },
      }),
      this.prisma.permitPackage.count({
        where: {
          dueDate: {
            lt: new Date(),
          },
          status: {
            not: PackageStatus.COMPLETED,
          },
        },
      }),
      this.prisma.permitPackage.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          county: true,
        },
      }),
    ]);

    return {
      totalPackages,
      pendingPackages,
      approvedPackages,
      overduePackages,
      recentPackages,
    };
  }

  async getChecklistItems(packageId: string) {
    const packageData = await this.prisma.permitPackage.findUnique({
      where: { id: packageId },
      include: {
        checklistItems: {
          orderBy: { sort: 'asc' },
        },
      },
    });

    if (!packageData) {
      throw new NotFoundException('Permit package not found');
    }

    return packageData.checklistItems;
  }

  async updateChecklistItem(itemId: string, completed: boolean, notes?: string) {
    const checklistItem = await this.prisma.packageChecklistItem.findUnique({
      where: { id: itemId },
    });

    if (!checklistItem) {
      throw new NotFoundException('Checklist item not found');
    }

    const updatedItem = await this.prisma.packageChecklistItem.update({
      where: { id: itemId },
      data: {
        completed,
        completedAt: completed ? new Date() : null,
        notes,
      },
    });

    return updatedItem;
  }

  async createChecklistItems(packageId: string, templateItems: any[]) {
    const packageData = await this.prisma.permitPackage.findUnique({
      where: { id: packageId },
    });

    if (!packageData) {
      throw new NotFoundException('Permit package not found');
    }

    const checklistItems = await Promise.all(
      templateItems.map(item =>
        this.prisma.packageChecklistItem.create({
          data: {
            label: item.label,
            category: item.category,
            required: item.required,
            sort: item.sort,
            packageId,
          },
        })
      )
    );

    return checklistItems;
  }

  private async generatePackageNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.permitPackage.count({
      where: {
        packageNumber: {
          startsWith: `PKG-${year}-`,
        },
      },
    });

    return `PKG-${year}-${(count + 1).toString().padStart(4, '0')}`;
  }
}
