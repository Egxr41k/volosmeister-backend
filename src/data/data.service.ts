import { Injectable } from '@nestjs/common'
import { Category, Manufacturer, Product, User } from '@prisma/client'
import { MinioService } from 'src/minio/minio.service'
import { PrismaService } from 'src/prisma.service'
import { ArchiveService } from './archive.service'

@Injectable()
export class DataService {
	constructor(
		private readonly archiveService: ArchiveService,
		private readonly minioService: MinioService,
		private readonly prismaService: PrismaService
	) {}

	async import(archive: Express.Multer.File) {
		const { products, categories, manufacturers, users, images } =
			await this.archiveService.unzip(archive)

		const imageUrls = await this.safeCreateImages(images)
		const categoriesData = await this.safeCreateCategories(categories)
		const manufacturersData = await this.safeCreateManufacturers(manufacturers)
		const userData = await this.safeCreateUsers(users)
		const productsData = await this.safeCreateProducts(products, imageUrls)

		return { categoriesData, manufacturersData, userData, productsData }
	}

	private async safeCreateImages(images: Express.Multer.File[]) {
		return await Promise.all(
			images.map(async image => {
				return {
					url: await this.uploadIfNotExist(image),
					name: image.originalname
				}
			})
		)
	}

	private async uploadIfNotExist(image: Express.Multer.File) {
		const existingUrl = await this.minioService.getFileUrl(image.originalname)

		console.log(image.originalname, '>', existingUrl)
		if (existingUrl) return existingUrl

		await this.minioService.uploadFile(image)
		return await this.minioService.getFileUrl(image.originalname)
	}

	private async safeCreateCategories(categories: Category[]) {
		const created = new Map<string, Category>()

		while (created.size < categories.length) {
			let progress = false

			for (const category of categories) {
				if (created.has(category.name)) continue

				const parentIsReady =
					!category.parentId ||
					[...created.values()].some(cat => cat.id === category.parentId)

				if (parentIsReady) {
					const existing = await this.prismaService.category.findUnique({
						where: { name: category.name }
					})

					let createdCategory: Category
					if (existing) {
						createdCategory = existing
					} else {
						createdCategory = await this.prismaService.category.create({
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

	private async safeCreateUsers(users: User[]) {
		return await Promise.all(
			users.map(async user => {
				const existingUser = await this.prismaService.user.findUnique({
					where: { email: user.email }
				})
				if (existingUser) {
					return existingUser
				} else {
					return await this.prismaService.user.create({
						data: user
					})
				}
			})
		)
	}

	private async safeCreateManufacturers(manufacturers: Manufacturer[]) {
		return await Promise.all(
			manufacturers.map(async manufacturer => {
				const existingManufacturer =
					await this.prismaService.manufacturer.findUnique({
						where: { name: manufacturer.name }
					})
				if (existingManufacturer) {
					return existingManufacturer
				} else {
					return await this.prismaService.manufacturer.create({
						data: manufacturer
					})
				}
			})
		)
	}

	private async safeCreateProducts(
		products: Product[],
		images: { url: string; name: string }[]
	) {
		const defaultUser = await this.prismaService.user.findFirst()
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
		const existingProduct = await this.prismaService.product.findUnique({
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

		return this.prismaService.product.create({
			data: {
				...product,
				userId: productUserId,
				images: productImages
			}
		})
	}

	async export() {
		const products = await this.prismaService.product.findMany({
			orderBy: { id: 'asc' }
		})
		const categories = await this.prismaService.category.findMany({
			orderBy: { id: 'asc' }
		})
		const manufacturers = await this.prismaService.manufacturer.findMany({
			orderBy: { id: 'asc' }
		})
		const users = await this.prismaService.user.findMany({
			orderBy: { id: 'asc' }
		})
		const images = await this.minioService.listFiles()

		//write filenames instead uls
		const preparedProducts = products.map(product => ({
			...product,
			images: product.images.map(image => this.minioService.getNameByUrl(image))
		}))

		const zipPath = await this.archiveService.zip({
			products: preparedProducts,
			categories,
			manufacturers,
			users,
			images
		})

		return zipPath
	}
}
