import { Injectable } from '@nestjs/common'
import { CategoryService } from 'src/category/category.service'
import { ManufacturerService } from 'src/manufacturer/manufacturer.service'
import { MinioService } from 'src/minio/minio.service'
import { ProductService } from 'src/product/product.service'
import { UserService } from 'src/user/user.service'
import { ArchiveService } from './archive.service'

@Injectable()
export class DataService {
	constructor(
		private readonly archiveService: ArchiveService,
		private readonly minioService: MinioService,
		private readonly categoryService: CategoryService,
		private readonly manufacturerService: ManufacturerService,
		private readonly userService: UserService,
		private readonly productServise: ProductService
	) {}

	async safeImport(archive: Express.Multer.File) {
		const { products, categories, manufacturers, users, images } =
			await this.archiveService.unzip(archive)

		const imageUrls = await this.minioService.safeUpload(images)
		const categoriesData = await this.categoryService.safeCreateMany(categories)
		const manufacturersData =
			await this.manufacturerService.safeCreateMany(manufacturers)
		const userData = await this.userService.safeCreateMany(users)
		const productsData = await this.productServise.safeCreateMany(
			products,
			imageUrls
		)

		return { categoriesData, manufacturersData, userData, productsData }
	}

	async import(archive: Express.Multer.File) {
		const { products, categories, manufacturers, users, images } =
			await this.archiveService.unzip(archive)

		const imageUrls = await this.minioService.forceUploadMany(images)

		const categoriesData =
			await this.categoryService.forceCreateMany(categories)

		const manufacturersData =
			await this.manufacturerService.forceCreateMany(manufacturers)

		const usersData = await this.userService.forceCreateMany(users)

		const productsData = await this.productServise.forceCreateMany(
			products,
			imageUrls
		)

		return { categoriesData, manufacturersData, usersData, productsData }
	}

	async export() {
		const { products } = await this.productServise.getAll()
		const categories = await this.categoryService.getAll()
		const manufacturers = await this.manufacturerService.getAll()
		const users = await this.userService.getAll()
		const images = await this.minioService.listFiles()

		//write filenames instead uls
		const preparedProducts = products.map(product => ({
			...product,
			images: product.images.map(image => this.minioService.getNameByUrl(image))
		}))

		return await this.archiveService.zip({
			products: preparedProducts,
			categories,
			manufacturers,
			users,
			images
		})
	}
}
