import {
	Controller,
	Delete,
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

	@Post('image')
	//@Auth('admin')
	@HttpCode(200)
	@UseInterceptors(FileInterceptor('image'))
	async uploadImage(@UploadedFile() file: Express.Multer.File) {
		await this.minioService.uploadFile(file)
		return this.minioService.getFileStaticUrl(file.originalname)
	}

	@Delete('image/:fileName')
	//@Auth('admin')
	@HttpCode(200)
	async deleteImage(@Param('fileName') fileName: string) {
		return await this.minioService.deleteFile(fileName)
	}
}
