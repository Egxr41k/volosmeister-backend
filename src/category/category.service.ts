import { Injectable, NotFoundException } from '@nestjs/common'
import { Category } from '@prisma/client'
import slug from 'slug'
import { PrismaService } from 'src/prisma.service'
import { CategoryTree } from './category-with-children'
import { CategoryDto } from './category.dto'
import { returnCategoryObject } from './return-category.object'

@Injectable()
export class CategoryService {
	constructor(private prisma: PrismaService) {}

	async byId(id: number) {
		const category = await this.prisma.category.findUnique({
			where: { id },
			select: returnCategoryObject
		})

		if (!category) {
			throw new Error('Category not found')
		}

		return category
	}

	async bySlug(slug: string) {
		const category = await this.prisma.category.findUnique({
			where: { slug },
			select: returnCategoryObject
		})

		if (!category) {
			throw new NotFoundException('Category not found')
		}

		return category
	}

	async getAll() {
		const categories = await this.prisma.category.findMany({
			select: returnCategoryObject,
			orderBy: { id: 'asc' }
		})

		if (!categories) {
			throw new Error('Categories not found')
		}

		return categories
	}

	async getAllAsTree() {
		const rootCategories = await this.getRoot()
		return await Promise.all(
			rootCategories.map(async category => {
				return (await this.loadTreeRecursive({
					...category,
					children: []
				})) as CategoryTree
			})
		)
	}

	async getRoot() {
		const categories = await this.prisma.category.findMany({
			where: { parentId: null },

			select: returnCategoryObject
		})

		if (!categories) {
			throw new Error('Categories not found')
		}

		return categories
	}

	async getChildren(id: number) {
		const categories = await this.prisma.category.findMany({
			where: {
				parentId: id
			},
			select: returnCategoryObject
		})

		if (!categories) {
			throw new Error('Categories not found')
		}

		return categories
	}

	async getTreeFromRoot(id: number) {
		let root = await this.prisma.category.findUnique({
			where: { id }
		})

		return await this.loadTreeRecursive({
			...root,
			children: []
		})
	}

	async loadTreeRecursive(current: CategoryTree): Promise<CategoryTree> {
		const children = await this.prisma.category.findMany({
			where: { parentId: current.id }
		})

		const сhildrenWithChildren = await Promise.all(
			children.map(child =>
				this.loadTreeRecursive({
					...child,
					children: []
				})
			)
		)

		return {
			...current,
			children: сhildrenWithChildren
		} as CategoryTree
	}

	async getTreeFromLeaf(id: number) {
		const current = await this.prisma.category.findUnique({
			where: { id }
		})

		let currentTreeHead: CategoryTree = { ...current, children: [] }

		while (currentTreeHead.parentId !== null) {
			const parent = await this.prisma.category.findUnique({
				where: { id: currentTreeHead.parentId }
			})

			const children = await this.prisma.category.findMany({
				where: { parentId: parent.id }
			})

			const preparedChildren = children.map(child => {
				if (child.id === currentTreeHead.id) {
					return currentTreeHead
				} else {
					return {
						...child,
						children: []
					} as CategoryTree
				}
			})

			currentTreeHead = { ...parent, children: preparedChildren }
		}
		return currentTreeHead
	}

	async create(dto: CategoryDto) {
		return await this.prisma.category.create({
			data: {
				name: dto.name,
				slug: slug(dto.name),
				parent: dto.parentId ? { connect: { id: dto.parentId } } : undefined
			}
		})
	}

	async createIfNotExist(categoryName: string) {
		const existingCateory = await this.prisma.category.findUnique({
			where: {
				name: categoryName
			}
		})
		if (existingCateory) {
			return existingCateory
		} else {
			return await this.create({ name: categoryName } as CategoryDto)
		}
	}

	async safeCreateMany(categories: Category[]) {
		const created = new Map<string, Category>()

		while (created.size < categories.length) {
			let progress = false

			for (const category of categories) {
				if (created.has(category.name)) continue

				const parentIsReady =
					!category.parentId ||
					[...created.values()].some(cat => cat.id === category.parentId)

				if (parentIsReady) {
					const existing = await this.prisma.category.findUnique({
						where: { name: category.name }
					})

					let createdCategory: Category
					if (existing) {
						createdCategory = existing
					} else {
						createdCategory = await this.prisma.category.create({
							data: category
						})
					}

					created.set(category.name, createdCategory)
					progress = true
				}
			}

			if (!progress) {
				throw new Error(
					'Circular or unresolved parent-child dependency in category list.'
				)
			}
		}

		return [...created.values()]
	}

	async forceCreateMany(categories: Category[]) {
		await this.prisma.category.deleteMany()
		const categoriesData = await this.prisma.category.createMany({
			data: categories
		})
		this.prisma.resetIdSequenceFor('Category')
		return categoriesData
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
