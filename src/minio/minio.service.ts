import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'

@Injectable()
export class MinioService {
	private s3: S3Client
	private bucketName = 'images'

	constructor() {
		this.s3 = new S3Client({
			endpoint: 'http://localhost:9000', // URL MinIO
			region: 'us-east-1', // Стандартный регион
			credentials: {
				accessKeyId: 'admin', // Ваш логин MinIO
				secretAccessKey: 'admin123' // Ваш пароль MinIO
			}
		})
	}

	// Метод для загрузки файлов
	async uploadFile(buffer: Buffer, key: string) {
		const command = new PutObjectCommand({
			Bucket: this.bucketName,
			Key: key, // Уникальное имя файла
			Body: buffer, // Содержимое файла
			ContentType: 'image/jpeg' // Тип контента
		})

		await this.s3.send(command)
		return `http://localhost:9000/${this.bucketName}/${key}`
	}
}
