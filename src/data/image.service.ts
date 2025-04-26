import { Injectable } from '@nestjs/common'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { Readable } from 'stream'
import { IMAGE_FOLDER } from './constants'

@Injectable()
export class ImageService {
	async readImages(outputDir: string) {
		const imagesDir = join(outputDir, IMAGE_FOLDER)

		const files = await readdir(imagesDir)
		return await Promise.all(
			files.map(async file => ({
				name: file,
				file: await this.readImageFile(outputDir, file)
			}))
		)
	}

	private async readImageFile(imagesDir: string, filename: string) {
		const filePath = join(imagesDir, filename)
		const fileBuffer = await readFile(filePath)

		return {
			fieldname: 'file',
			originalname: filename,
			encoding: '7bit',
			mimetype: 'image/jpeg', // this.getMimeType(filename),
			buffer: fileBuffer,
			size: fileBuffer.length,
			destination: '',
			filename: '',
			path: '',
			stream: new Readable()
		} as Express.Multer.File
	}
}
