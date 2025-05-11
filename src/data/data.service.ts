import { Injectable } from '@nestjs/common'
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
		const { products, categories, manufacturers, images } =
			await this.archiveService.unzip(archive)

		const imageUrls = await Promise.all(
			images.map(async image => ({
				...(await this.minioService.uploadFile(image.file)),
				name: image.name
			}))
		)

		const categoriesData = await this.prismaService.category.createMany({
			data: categories
		})

		const manufacturersData = await this.prismaService.manufacturer.createMany({
			data: manufacturers
		})

		const productsData = await this.prismaService.product.createMany({
			data: products.map(product => ({
				...product,
				images: imageUrls
					.filter(image => product.images.includes(image.name))
					.map(image => image.imageUrl)
			}))
		})

		return {}
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
