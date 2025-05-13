import { Injectable } from '@nestjs/common'
import { Category, Manufacturer, Product } from '@prisma/client'
import { MinioService } from 'src/minio/minio.service'
import { PrismaService } from 'src/prisma.service'
import { ArchiveService, ImageFile } from './archive.service'

@Injectable()
export class DataService {
	constructor(
		private readonly archiveService: ArchiveService,
		private readonly minioService: MinioService,
		private readonly prismaService: PrismaService
	) {}

	async import(archive: Express.Multer.File) {
		try {
			const { products, categories, manufacturers, images } =
				await this.archiveService.unzip(archive)

			const imageUrls = await this.safeCreateImages(images)

			const categoriesData = await this.safeCreateCategories(categories)

			const manufacturersData =
				await this.safeCreateManufacturers(manufacturers)

			const productsData = await this.safeCreateProducts(products, imageUrls)
			console.log('products:', productsData)

			return { categoriesData, manufacturersData, productsData }
		} catch (error) {
			console.error('Error during import:', error)
			throw new Error('Import failed')
		}
	}

	private async safeCreateImages(images: ImageFile[]) {
		return await Promise.all(
			images.map(async image => {
				// check is exist file with the same name
				const existingImage = await this.minioService.checkIfFileExists(
					image.name
				)

				return {
					url: existingImage
						? existingImage
						: await this.minioService.uploadFile(image.file),
					name: image.name
				}
			})
		)
	}

	private async safeCreateCategories(categories: Category[]) {
		try {
			return await Promise.all(
				categories.map(async category => {
					const existingCategory = await this.prismaService.category.findUnique(
						{
							where: { name: category.name }
						}
					)
					if (existingCategory) {
						return existingCategory
					} else {
						return await this.prismaService.category.create({
							data: category
						})
					}
				})
			)
		} catch (error) {
			console.error('Error importing categories:', error)
			throw new Error('Failed to import categories')
		}
	}

	private async safeCreateManufacturers(manufacturers: Manufacturer[]) {
		try {
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
		} catch (error) {
			console.error('Error importing manufacturers:', error)
			throw new Error('Failed to import manufacturers')
		}
	}

	private async safeCreateProducts(
		products: Product[],
		images: { url: string; name: string }[]
	) {
		try {
			// First, get a valid user from the database
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
		} catch (error) {
			console.error('Error importing products:', error)
			throw new Error('Failed to import products')
		}
	}

	async export() {
		const products = await this.prismaService.product.findMany({})
		const categories = await this.prismaService.category.findMany({})
		const manufacturers = await this.prismaService.manufacturer.findMany({})
		const images = await this.minioService.listFiles() // getAllFiles()

		const zipPath = await this.archiveService.zip({
			products,
			categories,
			manufacturers,
			images
		})

		return zipPath
	}
}
