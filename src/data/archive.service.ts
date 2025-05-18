import { Injectable } from '@nestjs/common'
import { Category, Manufacturer, Product, User } from '@prisma/client'
import archiver from 'archiver'
import { createWriteStream } from 'fs'
import { mkdir, mkdtemp, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import unzipper from 'unzipper'
import { ImageService } from './image.service'
import { JsonService } from './json.service'

export interface IArchiveData {
	products: Product[]
	categories: Category[]
	manufacturers: Manufacturer[]
	users: User[]
	images: Express.Multer.File[]
}

@Injectable()
export class ArchiveService {
	constructor(
		private readonly jsonService: JsonService,
		private readonly imageService: ImageService
	) {}

	async unzip(archive: Express.Multer.File): Promise<IArchiveData> {
		const tempDir = await mkdtemp(join(tmpdir(), 'temp-'))

		const zipPath = join(tempDir, archive.originalname)
		await writeFile(zipPath, archive.buffer)

		await unzipper.Open.file(zipPath).then(d => d.extract({ path: tempDir }))

		const outputDir = tempDir

		const products = await this.jsonService.readProducts(outputDir)
		const categories = await this.jsonService.readCategories(outputDir)
		const manufacturers = await this.jsonService.readManufacturers(outputDir)
		const users = await this.jsonService.readUsers(outputDir)
		const images = await this.imageService.readImages(outputDir)

		//await rm(tempDir, { force: true })

		return {
			products,
			categories,
			manufacturers,
			users,
			images
		}
	}

	async zip(archiveData: IArchiveData) {
		const tempDir = await mkdtemp(join(tmpdir(), 'temp-'))
		const acrhiveName = 'output'
		const outputDir = join(tempDir, acrhiveName)
		await mkdir(outputDir)
		await this.jsonService.writeProducts(outputDir, archiveData.products)
		await this.jsonService.writeCategories(outputDir, archiveData.categories)
		await this.jsonService.writeManufacturers(
			outputDir,
			archiveData.manufacturers
		)
		await this.jsonService.writeUsers(outputDir, archiveData.users)
		await this.imageService.writeImages(outputDir, archiveData.images)

		const zipPath = join(tempDir, `${acrhiveName}.zip`)
		return new Promise<string>((resolve, reject) => {
			const output = createWriteStream(zipPath)
			const archive = archiver('zip', { zlib: { level: 9 } })

			output.on('close', () => resolve(zipPath))
			archive.on('error', reject)

			archive.pipe(output)
			archive.directory(outputDir, false)
			archive.finalize()
		})
	}
}
