import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractorDto } from './dto/create-contractor.dto';
import { UpdateContractorDto } from './dto/update-contractor.dto';

@Injectable()
export class ContractorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createContractorDto: CreateContractorDto) {
    const contractor = await this.prisma.contractor.create({
      data: {
        companyName: createContractorDto.companyName,
        contactName: createContractorDto.contactName,
        email: createContractorDto.email,
        phone: createContractorDto.phone,
        licenseNumber: createContractorDto.licenseNumber,
        address: createContractorDto.address
          ? {
              create: {
                street: createContractorDto.address.street,
                city: createContractorDto.address.city,
                state: createContractorDto.address.state || 'FL',
                zipCode: createContractorDto.address.zipCode,
                county: createContractorDto.address.county,
              },
            }
          : undefined,
      },
      include: {
        address: true,
        _count: {
          select: {
            packages: true,
          },
        },
      },
    });

    return contractor;
  }

  async findAll(query: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { companyName: { contains: search, mode: 'insensitive' as any } },
            { contactName: { contains: search, mode: 'insensitive' as any } },
            { email: { contains: search, mode: 'insensitive' as any } },
            { phone: { contains: search, mode: 'insensitive' as any } },
            { licenseNumber: { contains: search, mode: 'insensitive' as any } },
          ],
        }
      : {};

    const [contractors, total] = await Promise.all([
      this.prisma.contractor.findMany({
        where,
        include: {
          address: true,
          _count: {
            select: {
              packages: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contractor.count({ where }),
    ]);

    return {
      data: contractors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { id },
      include: {
        address: true,
        packages: {
          include: {
            county: true,
            customer: true,
            address: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            packages: true,
          },
        },
      },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor not found');
    }

    return contractor;
  }

  async update(id: string, updateContractorDto: UpdateContractorDto) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { id },
      include: { address: true },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor not found');
    }

    const updatedContractor = await this.prisma.contractor.update({
      where: { id },
      data: {
        companyName: updateContractorDto.companyName,
        contactName: updateContractorDto.contactName,
        email: updateContractorDto.email,
        phone: updateContractorDto.phone,
        licenseNumber: updateContractorDto.licenseNumber,
        address: updateContractorDto.address
          ? {
              upsert: {
                create: {
                  street: updateContractorDto.address.street,
                  city: updateContractorDto.address.city,
                  state: updateContractorDto.address.state || 'FL',
                  zipCode: updateContractorDto.address.zipCode,
                  county: updateContractorDto.address.county,
                },
                update: {
                  street: updateContractorDto.address.street,
                  city: updateContractorDto.address.city,
                  state: updateContractorDto.address.state || 'FL',
                  zipCode: updateContractorDto.address.zipCode,
                  county: updateContractorDto.address.county,
                },
              },
            }
          : undefined,
      },
      include: {
        address: true,
        _count: {
          select: {
            packages: true,
          },
        },
      },
    });

    return updatedContractor;
  }

  async remove(id: string) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { id },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor not found');
    }

    await this.prisma.contractor.delete({
      where: { id },
    });

    return { message: 'Contractor deleted successfully' };
  }
}
