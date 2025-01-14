import {
	Controller,
	Delete,
	Get,
	Param,
	Post,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { MinioService } from './minio.service'

@Controller('minio')
export class MinioController {
	constructor(private readonly minioService: MinioService) {}

	@Post('image')
	@UseInterceptors(FileInterceptor('file'))
	async uploadImage(@UploadedFile() file: Express.Multer.File) {
		console.log(file)
		await this.minioService.createBucketIfNotExists()
		return await this.minioService.uploadFile(file)
	}

	@Get()
	async getBuckets() {
		return 'hello minio'
	}

	@Get('image/:fileName')
	async getImage(@Param('fileName') fileName: string) {
		return await this.minioService.getFileUrl(fileName)
	}

	@Delete('image/:fileName')
	async deleteImage(@Param('fileName') fileName: string) {
		await this.minioService.deleteFile(fileName)
		return fileName
	}
}
