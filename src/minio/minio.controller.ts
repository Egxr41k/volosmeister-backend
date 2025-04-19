import {
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { MinioService } from './minio.service'
import { Auth } from 'src/auth/decorators/auth.decorator'

@Controller('minio')
export class MinioController {
	constructor(private readonly minioService: MinioService) {}

	@Post('image')
	@Auth('admin')
	@HttpCode(200)
	@UseInterceptors(FileInterceptor('file'))
	async uploadImage(@UploadedFile() file: Express.Multer.File) {
		await this.minioService.createBucketIfNotExists()
		return await this.minioService.uploadFile(file)
	}

	@Delete('image/:fileName')
	@Auth('admin')
	@HttpCode(200)
	async deleteImage(@Param('fileName') fileName: string) {
		await this.minioService.deleteFile(fileName)
		return fileName
	}
}
