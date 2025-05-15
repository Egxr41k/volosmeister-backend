import { Injectable } from '@nestjs/common'
import { mkdir, readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { fileFromBuffer } from 'src/utils/file-from-buffer'
import { IMAGE_FOLDER } from './constants'

@Injectable()
export class ImageService {
	async readImages(outputDir: string) {
		const imagesDir = join(outputDir, IMAGE_FOLDER)

		const files = await readdir(imagesDir)
		return await Promise.all(
			files.map(async file => await this.readImageFile(imagesDir, file))
		)
	}

	private async readImageFile(imagesDir: string, filename: string) {
		const filePath = join(imagesDir, filename)
		const fileBuffer = await readFile(filePath)

		return fileFromBuffer(filename, fileBuffer)
	}

	async writeImages(outputDir: string, images: Express.Multer.File[]) {
		const imagesDir = join(outputDir, IMAGE_FOLDER)
		await mkdir(imagesDir, { recursive: true })

		await Promise.all(
			images.map(image =>
				writeFile(join(imagesDir, image.originalname), image.buffer)
			)
		)
	}
}
