import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, Product, User } from '@prisma/client'
import slug from 'slug'
import { bfsCategoryTree } from 'src/category/bfs-category-tree'
import { CategoryService } from 'src/category/category.service'
import { FeatureService } from 'src/feature/feature.service'
import { ManufacturerService } from 'src/manufacturer/manufacturer.service'
import { PaginationService } from 'src/pagination/pagination.service'
import { PrismaService } from 'src/prisma.service'
import { PropertyService } from 'src/property/property.service'
import { convertToNumber } from 'src/utils/convert-to-number'
import { EnumProductSort, GetAllProductDto } from './dto/get-all.product.dto'
import { ProductDto } from './dto/product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import {
	productReturnObject,
	productReturnObjectFullest
} from './return-product.object'

@Injectable()
export class ProductService {
	constructor(
		private prisma: PrismaService,
		private paginationService: PaginationService,
		private categoryService: CategoryService,
		private manufacturerSevice: ManufacturerService,
		private featureService: FeatureService,
		private propertyService: PropertyService
	) {}

	async getAll(dto: GetAllProductDto = {}) {
		const filters = this.createFilter(dto)

		const { perPage, skip } = this.paginationService.getPagination(dto)

		const defaultIdSort = [
			{ id: 'asc' }
		] as Prisma.ProductOrderByWithRelationInput[]

		const orderBy = dto.sort ? this.getSortOption(dto.sort) : defaultIdSort

		const products = await this.prisma.product.findMany({
			where: filters,
			orderBy,
			skip,
			take: perPage,
			select: productReturnObject
		})

		return {
			products,
			length: await this.prisma.product.count({
				where: filters
			})
		}
	}

	private createFilter(dto: GetAllProductDto): Prisma.ProductWhereInput {
		const filters: Prisma.ProductWhereInput[] = []

		if (dto.searchTerm) filters.push(this.getSearchTermFilter(dto.searchTerm))

		if (dto.ratings)
			filters.push(
				this.getRaitingFilter(dto.ratings.split('|').map(raiting => +raiting))
			)

		if (dto.minPrice || dto.maxPrice)
			filters.push(
				this.getPriceFilter(
					convertToNumber(dto.minPrice),
					convertToNumber(dto.maxPrice)
				)
			)

		if (dto.categoryId) filters.push(this.getCategoryFilter(+dto.categoryId))

		return filters.length ? { AND: filters } : {}
	}

	private getSortOption(
		sort: EnumProductSort
	): Prisma.ProductOrderByWithRelationInput[] {
		switch (sort) {
			case EnumProductSort.LOW_PRICE:
				return [{ price: 'asc' }]
			case EnumProductSort.HIGH_PRICE:
				return [{ price: 'desc' }]
			case EnumProductSort.OLDEST:
				return [{ createAt: 'asc' }]
			default: // case EnumProductSort.NEWEST:
				return [{ createAt: 'desc' }]
		}
	}

	private getSearchTermFilter(searchTerm: string): Prisma.ProductWhereInput {
		return {
			OR: [
				{
					category: {
						name: {
							contains: searchTerm,
							mode: 'insensitive'
						}
					}
				},
				{
					name: {
						contains: searchTerm,
						mode: 'insensitive'
					}
				},
				{
					description: {
						contains: searchTerm,
						mode: 'insensitive'
					}
				}
			]
		}
	}

	private getRaitingFilter(rating: number[]): Prisma.ProductWhereInput {
		return {
			reviews: {
				some: {
					rating: {
						in: rating
					}
				}
			}
		}
	}

	private getPriceFilter(
		minPrice?: number,
		maxPrice?: number
	): Prisma.ProductWhereInput {
		let priceFilter: Prisma.IntFilter | undefined = undefined

		if (minPrice) {
			priceFilter = {
				...priceFilter,
				gte: minPrice
			}
		}

		if (maxPrice) {
			priceFilter = {
				...priceFilter,
				lte: maxPrice
			}
		}

		return {
			price: priceFilter
		}
	}

	private getCategoryFilter(categoryId: number): Prisma.ProductWhereInput {
		return {
			categoryId
		}
	}

	async byId(id: number) {
		const product = await this.prisma.product.findUnique({
			where: {
				id
			},
			select: productReturnObjectFullest
		})

		if (!product) {
			throw new Error('Product not found')
		}

		return product
	}

	async bySlug(slug: string) {
		const products = await this.prisma.product.findUnique({
			where: {
				slug
			},
			select: productReturnObjectFullest
		})

		if (!products) {
			throw new NotFoundException('Products not found')
		}

		return products
	}

	async byCategory(categorySlug: string) {
		const category = await this.categoryService.bySlug(categorySlug)
		const categoryTree = await this.categoryService.getTreeFromRoot(category.id)
		const allowedCategories = bfsCategoryTree(categoryTree)
		const products = await this.prisma.product.findMany({
			where: {
				category: {
					id: {
						in: allowedCategories
					}
				}
			},
			orderBy: {
				createAt: 'desc'
			},
			select: productReturnObjectFullest
		})

		if (!products) {
			throw new NotFoundException('Products not found')
		}

		return products
	}

	async getSimilar(id: number) {
		const currentProduct = await this.byId(id)

		if (!currentProduct) {
			throw new NotFoundException('Current product not found!')
		}

		const products = await this.prisma.product.findMany({
			where: {
				category: {
					name: currentProduct.name
				},
				NOT: {
					id: currentProduct.id
				}
			},
			orderBy: {
				createAt: 'desc'
			},
			select: productReturnObject
		})

		return products
	}

	async create(dto: ProductDto) {
		const {
			description,
			images,
			price,
			name,
			categoryName,
			manufacturerName,
			instructionForUse
		} = dto

		const existingProduct = await this.prisma.product.findUnique({
			where: { name }
		})

		if (existingProduct) {
			throw new Error(`Product with name ${name} already exists`)
		}

		const category = await this.categoryService.createIfNotExist(categoryName)
		const manufacturer =
			await this.manufacturerSevice.createIfNotExist(manufacturerName)

		return this.prisma.product.create({
			data: {
				name: name,
				description: description ?? '',
				instructionForUse: instructionForUse ?? '',
				images: images,
				price: price,
				slug: slug(name),
				categoryId: category.id,
				manufacturerId: manufacturer.id
			},
			select: productReturnObjectFullest
		})
	}

	async safeCreateMany(
		products: Product[],
		images: { url: string; name: string }[]
	) {
		const defaultUser = await this.prisma.user.findFirst()
		if (!defaultUser) {
			throw new Error('No users found in the database')
		}

		return Promise.all(
			products.map(
				async product => await this.createProduct(product, images, defaultUser)
			)
		)
	}

	async createProduct(
		product: Product,
		images: { url: string; name: string }[],
		defaultUser: User
	) {
		const existingProduct = await this.prisma.product.findUnique({
			where: { name: product.name }
		})

		if (existingProduct) {
			return existingProduct
		}

		const productUserId = product.userId ?? defaultUser.id

		const productImages = images
			.filter(image => product.images.includes(image.name))
			.map(image => image.url)

		console.log(product.images)
		console.log(productImages)

		return this.prisma.product.create({
			data: {
				...product,
				userId: productUserId,
				images: productImages
			}
		})
	}

	async forceCreateMany(
		products: Product[],
		imageUrls: { imageUrl: string; name: string }[]
	) {
		await this.prisma.product.deleteMany()
		const productsData = await this.prisma.product.createMany({
			data: products.map(product => {
				const productImages = imageUrls
					.filter(image => product.images.includes(image.name))
					.map(image => image.imageUrl)
				return {
					...product,
					images: productImages
				}
			})
		})
		this.prisma.resetIdSequenceFor('Product')
		return productsData
	}

	async update(id: number, dto: UpdateProductDto) {
		const { description, images, price, name, categoryName, manufacturerName } =
			dto

		const existingProduct = await this.prisma.product.findUnique({
			where: { id }
		})

		if (!existingProduct) {
			throw new Error(`Product with name ${name} not found`)
		}

		const category = await this.categoryService.createIfNotExist(categoryName)

		const manufacturer =
			await this.manufacturerSevice.createIfNotExist(manufacturerName)

		//update slug if name changed
		const newSlug =
			existingProduct.name === name ? existingProduct.slug : slug(name)

		await this.featureService.updateMany(id, dto.features)
		await this.propertyService.updateMany(id, dto.properties)

		return this.prisma.product.update({
			where: {
				id
			},
			data: {
				description,
				images,
				price,
				name,
				slug: newSlug,
				category: {
					connect: {
						id: category.id
					}
				},
				manufacturer: {
					connect: {
						id: manufacturer.id
					}
				}
			},
			select: productReturnObjectFullest
		})
	}

	async delete(id: number) {
		return this.prisma.product.delete({
			where: {
				id
			}
		})
	}
}
