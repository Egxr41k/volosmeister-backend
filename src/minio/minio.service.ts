import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Minio from 'minio'
import { ImageFile } from 'src/data/archive.service'

@Injectable()
export class MinioService {
	private minioClient: Minio.Client
	private bucketName: string

	constructor(private readonly configService: ConfigService) {
		this.minioClient = new Minio.Client({
			endPoint: this.configService.get('MINIO_ENDPOINT'),
			port: Number(this.configService.get('MINIO_PORT')),
			useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
			accessKey: this.configService.get('MINIO_ACCESS_KEY'),
			secretKey: this.configService.get('MINIO_SECRET_KEY')
		})
		this.bucketName = this.configService.get('MINIO_BUCKET_NAME')
	}

	async createBucketIfNotExists() {
		const bucketExists = await this.minioClient.bucketExists(this.bucketName)
		if (!bucketExists) {
			await this.minioClient.makeBucket(this.bucketName, 'eu-west-1')
		}
	}

	async listFiles(): Promise<ImageFile[]> {
		const files: ImageFile[] = []

		const stream = this.minioClient.listObjects(this.bucketName, '', true)

		return new Promise((resolve, reject) => {
			stream.on('data', async obj => {
				const buffer = await this.minioClient.getObject(
					this.bucketName,
					obj.name
				)
				const chunks = []
				for await (const chunk of buffer) {
					chunks.push(chunk)
				}
				const fileBuffer = Buffer.concat(chunks)

				files.push({
					name: obj.name,
					file: {
						fieldname: 'file',
						originalname: obj.name,
						encoding: '7bit',
						mimetype: 'image/jpeg', // можно подумать над auto-detect
						buffer: fileBuffer,
						size: fileBuffer.length,
						destination: '',
						filename: '',
						path: '',
						stream: buffer
					} as Express.Multer.File
				})
			})
			stream.on('end', () => resolve(files))
			stream.on('error', err => reject(err))
		})
	}

	async uploadFile(file: Express.Multer.File) {
		await this.minioClient.putObject(
			this.bucketName,
			file.originalname,
			file.buffer,
			file.size
		)
		const imageUrl = `http://localhost:9000/${this.bucketName}/${file.originalname}`
		return { message: 'File uploaded successfully', imageUrl }
	}

	async getFileUrl(fileName: string) {
		return await this.minioClient.presignedUrl('GET', this.bucketName, fileName)
	}

	async deleteFile(fileName: string) {
		await this.minioClient.removeObject(this.bucketName, fileName)
		return fileName
	}
}
