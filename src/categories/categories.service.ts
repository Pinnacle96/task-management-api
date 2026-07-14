import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: {
          name: dto.name.trim(),
          userId,
        },
      });
    } catch (error) {
      this.handleUniqueCategory(error);
      throw error;
    }
  }

  findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async ensureOwnedByUser(userId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, userId },
    });

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    return category;
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    await this.ensureOwnedByUser(userId, id);

    try {
      return await this.prisma.category.update({
        where: { id },
        data: {
          name: dto.name.trim(),
        },
      });
    } catch (error) {
      this.handleUniqueCategory(error);
      throw error;
    }
  }

  async remove(userId: string, id: string) {
    await this.ensureOwnedByUser(userId, id);
    await this.prisma.category.delete({ where: { id } });

    return { message: 'Category deleted successfully.' };
  }

  private handleUniqueCategory(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Category name already exists.');
    }
  }
}
