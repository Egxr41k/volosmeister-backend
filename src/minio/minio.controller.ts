import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { MinioService } from './minio.service'

@Controller('minio')
export class MinioController {
	constructor(private readonly minioService: MinioService) {}

	@Post('image')
	@UseInterceptors(FileInterceptor('file'))
	async uploadImage(@UploadedFile() file: Express.Multer.File) {
		const uniqueKey = `${Date.now()}-${file.originalname}`
		const imageUrl = await this.minioService.uploadFile(file.buffer, uniqueKey)
		return { message: 'File uploaded successfully', imageUrl }
	}
}
