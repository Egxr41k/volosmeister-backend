import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Client } from 'minio'
import { fileFromBuffer } from 'src/utils/file-from-buffer'
import { InjectMinio } from './minio.decorator'

@Injectable()
export class MinioService {
	private bucketName: string

	constructor(
		private readonly configService: ConfigService,
		@InjectMinio() private readonly minioClient: Client
	) {
		this.bucketName = this.configService.getOrThrow('MINIO_BUCKET_NAME')
	}

	async listFiles() {
		const files = [] as Express.Multer.File[]
		const objectsStream = this.minioClient.listObjectsV2(
			this.bucketName,
			'',
			true
		)

		for await (const obj of objectsStream) {
			const fileBuffer = await this.getFileBuffer(obj.name)
			const file = fileFromBuffer(obj.name, fileBuffer)

			files.push(file)
		}

		return this.sortFilesByTheirNames(files)
	}

	sortFilesByTheirNames(files: Express.Multer.File[]) {
		return files.sort((a, b) => {
			const [, aFirst, aSecond] = a.originalname.split('-').map(Number)
			const [, bFirst, bSecond] = b.originalname.split('-').map(Number)

			if (aFirst !== bFirst) {
				return aFirst - bFirst
			}
			return aSecond - bSecond
		})
	}

	async getFileBuffer(fileName: string): Promise<Buffer> {
		const stream = await this.minioClient.getObject(this.bucketName, fileName)
		const chunks = []
		for await (const chunk of stream) chunks.push(chunk)
		return Buffer.concat(chunks)
	}

	async safeUpload(images: Express.Multer.File[]) {
		return await Promise.all(
			images.map(async image => {
				return {
					url: await this.uploadIfNotExist(image),
					name: image.originalname
				}
			})
		)
	}

	private async uploadIfNotExist(image: Express.Multer.File) {
		const existingUrl = await this.getFileUrl(image.originalname)

		//console.log(image.originalname, '>', existingUrl)
		if (existingUrl) return existingUrl

		await this.uploadFile(image)
		return await this.getFileStaticUrl(image.originalname)
	}

	async forceUploadMany(images: Express.Multer.File[]) {
		await this.deleteAll()
		return await Promise.all(
			images.map(async image => {
				await this.uploadFile(image)
				return {
					imageUrl: await this.getFileStaticUrl(image.originalname),
					name: image.originalname
				}
			})
		)
	}

	async deleteAll() {
		const files = await this.listFiles()
		await this.minioClient.removeObjects(
			this.bucketName,
			files.map(f => f.originalname)
		)
	}

	async uploadFile(file: Express.Multer.File) {
		return await this.minioClient.putObject(
			this.bucketName,
			file.originalname,
			file.buffer,
			file.size
		)
	}

	async getFileUrl(fileName: string) {
		return await this.minioClient.presignedUrl('GET', this.bucketName, fileName)
	}

	getNameByUrl(url: string) {
		return url
			.split('?')[0]
			.split('/')
			.find(str => str.includes('image'))
	}

	getFileStaticUrl(fileName: string): string {
		// const endpoint = this.configService.getOrThrow('MINIO_ENDPOINT')
		// const port = this.configService.getOrThrow('MINIO_PORT')
		// const isMinioUseSsl = this.configService.get('MINIO_USE_SSL') === 'true'

		// const protocol = isMinioUseSsl ? 'https' : 'http'
		// return `${protocol}://${endpoint}:${port}/${this.bucketName}/${fileName}`
		return `/minio/${this.bucketName}/${fileName}`
	}

	async deleteFile(fileName: string) {
		return await this.minioClient.removeObject(this.bucketName, fileName)
	}
}
