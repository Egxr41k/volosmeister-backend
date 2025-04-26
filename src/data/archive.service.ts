import { Injectable } from '@nestjs/common'
import { mkdtemp, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { basename, extname, join } from 'path'
import * as unzipper from 'unzipper'
import { ImageService } from './image.service'
import { JsonService } from './json.service'

@Injectable()
export class ArchiveService {
	constructor(
		private readonly jsonService: JsonService,
		private readonly imageService: ImageService
	) {}

	async unzip(archive: Express.Multer.File) {
		const tempDir = await mkdtemp(join(tmpdir(), 'temp-'))

		const zipPath = join(tempDir, archive.originalname)
		await writeFile(zipPath, archive.buffer)

		await unzipper.Open.file(zipPath).then(d => d.extract({ path: tempDir }))

		const outputDir = join(tempDir, basename(zipPath, extname(zipPath)))

		const products = await this.jsonService.readProducts(outputDir)
		const categories = await this.jsonService.readCategories(outputDir)
		const manufacturers = await this.jsonService.readManufacturers(outputDir)
		const images = await this.imageService.readImages(outputDir)

		await rm(tempDir, { force: true })

		return {
			products,
			categories,
			manufacturers,
			images
		}
	}

	async zip() {}
}
