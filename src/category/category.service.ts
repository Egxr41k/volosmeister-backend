import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { slug } from 'src/utils/slug'
import { CategoryDto } from './category.dto'
import { returnCategoryObject } from './return-category.object'

@Injectable()
export class CategoryService {
	constructor(private prisma: PrismaService) {}

	async byId(id: number) {
		const category = await this.prisma.category.findUnique({
			where: {
				id
			},
			select: returnCategoryObject
		})

		if (!category) {
			throw new Error('Category not found')
		}

		return category
	}

	async bySlug(slug: string) {
		const category = await this.prisma.category.findUnique({
			where: {
				slug
			},
			select: returnCategoryObject
		})

		if (!category) {
			throw new NotFoundException('Category not found')
		}

		return category
	}

	async getAll() {
		const category = await this.prisma.category.findMany({
			select: returnCategoryObject
		})

		if (!category) {
			throw new Error('Category not found')
		}

		return category
	}

	async create(dto: CategoryDto) {
		return await this.prisma.category.create({
			data: {
				name: dto.name,
				slug: slug(dto.name)
			}
		})
	}

	async createIfNotExist(categoryName: string) {
		const existingCateory = await this.prisma.category.findUnique({
			where: {
				slug: slug(categoryName)
			},
		})
		if (existingCateory) {
			return existingCateory
		} else {
			return await this.create({name: categoryName} as CategoryDto)
		}
	}

	async update(id: number, dto: CategoryDto) {
		return this.prisma.category.update({
			where: {
				id
			},
			data: {
				name: dto.name,
				slug: slug(dto.name)
			}
		})
	}

	async delete(id: number) {
		return this.prisma.category.delete({
			where: {
				id
			}
		})
	}
}
