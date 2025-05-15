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

		return files
	}

	async getFileBuffer(fileName: string): Promise<Buffer> {
		const stream = await this.minioClient.getObject(this.bucketName, fileName)
		const chunks = []
		for await (const chunk of stream) chunks.push(chunk)
		return Buffer.concat(chunks)
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

	getFileStaticUrl(fileName: string): string {
		const endpoint = this.configService.getOrThrow('MINIO_ENDPOINT')
		const port = this.configService.getOrThrow('MINIO_PORT')
		const isMinioUseSsl = this.configService.get('MINIO_USE_SSL') === 'true'

		const protocol = isMinioUseSsl ? 'https' : 'http'
		return `${protocol}://${endpoint}:${port}/${this.bucketName}/${fileName}`
	}

	async deleteFile(fileName: string) {
		return await this.minioClient.removeObject(this.bucketName, fileName)
	}
}
