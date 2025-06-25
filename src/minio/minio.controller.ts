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

@Controller('minio')
export class MinioController {
	constructor(private readonly minioService: MinioService) {}

	@Get('image/:fileName')
	//@Auth('admin')
	@HttpCode(200)
	async getImage(@Param('fileName') fileName: string) {
		return this.minioService.getFileUrl(fileName)
	}

	@Post('image')
	//@Auth('admin')
	@HttpCode(200)
	@UseInterceptors(FileInterceptor('file'))
	async uploadImage(@UploadedFile() file: Express.Multer.File) {
		await this.minioService.uploadFile(file)
	}

	@Delete('image/:fileName')
	//@Auth('admin')
	@HttpCode(200)
	async deleteImage(@Param('fileName') fileName: string) {
		return await this.minioService.deleteFile(fileName)
	}
}
