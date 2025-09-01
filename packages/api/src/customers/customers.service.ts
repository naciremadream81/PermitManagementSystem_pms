import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const customer = await this.prisma.customer.create({
      data: {
        firstName: createCustomerDto.firstName,
        lastName: createCustomerDto.lastName,
        email: createCustomerDto.email,
        phone: createCustomerDto.phone,
        address: createCustomerDto.address
          ? {
              create: {
                street: createCustomerDto.address.street,
                city: createCustomerDto.address.city,
                state: createCustomerDto.address.state || 'FL',
                zipCode: createCustomerDto.address.zipCode,
                county: createCustomerDto.address.county,
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

    return customer;
  }

  async findAll(query: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as any } },
            { lastName: { contains: search, mode: 'insensitive' as any } },
            { email: { contains: search, mode: 'insensitive' as any } },
            { phone: { contains: search, mode: 'insensitive' as any } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
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
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        address: true,
        packages: {
          include: {
            county: true,
            contractor: true,
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

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { address: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const updatedCustomer = await this.prisma.customer.update({
      where: { id },
      data: {
        firstName: updateCustomerDto.firstName,
        lastName: updateCustomerDto.lastName,
        email: updateCustomerDto.email,
        phone: updateCustomerDto.phone,
        address: updateCustomerDto.address
          ? {
              upsert: {
                create: {
                  street: updateCustomerDto.address.street,
                  city: updateCustomerDto.address.city,
                  state: updateCustomerDto.address.state || 'FL',
                  zipCode: updateCustomerDto.address.zipCode,
                  county: updateCustomerDto.address.county,
                },
                update: {
                  street: updateCustomerDto.address.street,
                  city: updateCustomerDto.address.city,
                  state: updateCustomerDto.address.state || 'FL',
                  zipCode: updateCustomerDto.address.zipCode,
                  county: updateCustomerDto.address.county,
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

    return updatedCustomer;
  }

  async remove(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.prisma.customer.delete({
      where: { id },
    });

    return { message: 'Customer deleted successfully' };
  }
}
