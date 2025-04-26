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

		// 1. Сохраняем изображения в MinIO
		const imageUrls = await Promise.all(
			images.map(async image => ({
				...(await this.minioService.uploadFile(image.file)),
				name: image.name
			}))
		)

		// 2. Сохраняем категории в БД
		const categoriesData = await this.prismaService.category.createMany({
			data: categories
		})

		// 3. Сохраняем производителей в БД
		const manufacturersData = await this.prismaService.manufacturer.createMany({
			data: manufacturers
		})

		// 4. Сохраняем товары в БД
		const productsData = await this.prismaService.product.createMany({
			data: products.map(product => ({
				...product,
				images: imageUrls
					.filter(image => product.images.includes(image.name))
					.map(image => image.imageUrl) // Extract only the imageUrl property
			}))
		})

		return {
			categories: categoriesData,
			manufacturers: manufacturersData,
			products: productsData
		}
	}

	async export() {
		this.archiveService.zip()
		//...
	}
}
