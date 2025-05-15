import { Injectable } from '@nestjs/common'
import { Category, Manufacturer, Product } from '@prisma/client'
import * as archiver from 'archiver'
import { createWriteStream } from 'fs'
import { mkdir, mkdtemp, readdir, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { basename, extname, join } from 'path'
import * as unzipper from 'unzipper'
import { ImageService } from './image.service'
import { JsonService } from './json.service'

export interface IArchiveData {
	products: Product[]
	categories: Category[]
	manufacturers: Manufacturer[]
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

		const outputDir = join(tempDir, basename(zipPath, extname(zipPath)))
		console.log('outputDir:', outputDir)
		const products = await this.jsonService.readProducts(outputDir)
		const categories = await this.jsonService.readCategories(outputDir)
		const manufacturers = await this.jsonService.readManufacturers(outputDir)
		const images = await this.imageService.readImages(outputDir)

		//await rm(tempDir, { force: true })

		return {
			products,
			categories,
			manufacturers,
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
		await this.imageService.writeImages(outputDir, archiveData.images)

		console.log(await readdir(outputDir))
		//console: [ 'categories.json', 'images', 'manufacturers.json', 'products.json' ]

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
