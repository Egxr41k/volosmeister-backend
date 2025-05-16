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
				const existingImage = await this.minioService.getFileUrl(
					image.originalname
				)

				if (existingImage) {
					return {
						url: existingImage,
						name: image.originalname
					}
				} else {
					await this.minioService.uploadFile(image)
					const url = await this.minioService.getFileUrl(image.originalname)
					return {
						url,
						name: image.originalname
					}
				}
			})
		)
	}

	private async safeCreateCategories(categories: Category[]) {
		return await Promise.all(
			categories.map(async category => {
				const existingCategory = await this.prismaService.category.findUnique({
					where: { name: category.name }
				})
				if (existingCategory) {
					return existingCategory
				} else {
					return await this.prismaService.category.create({
						data: category
					})
				}
			})
		)
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

		return await Promise.all(
			products.map(async product => {
				const existingProduct = await this.prismaService.product.findUnique({
					where: { name: product.name }
				})
				if (existingProduct) {
					return existingProduct
				} else {
					return await this.prismaService.product.create({
						data: {
							...product,
							userId: defaultUser.id,
							images: images
								.filter(image => product.images.includes(image.name))
								.map(image => image.url)
						}
					})
				}
			})
		)
	}

	async export() {
		const products = await this.prismaService.product.findMany({})
		const categories = await this.prismaService.category.findMany({})
		const manufacturers = await this.prismaService.manufacturer.findMany({})
		const users = await this.prismaService.user.findMany({})
		const images = await this.minioService.listFiles() // getAllFiles()

		const zipPath = await this.archiveService.zip({
			products,
			categories,
			manufacturers,
			users,
			images
		})

		return zipPath
	}
}
