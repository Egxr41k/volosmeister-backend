import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { DataService } from './data.service'

@Controller('data')
export class DataController {
	constructor(private readonly dataService: DataService) {}

	@Post('/import')
	@UseInterceptors(FileInterceptor('file'))
	create(@UploadedFile() file: Express.Multer.File) {
		return this.dataService.import(file)
	}

	@Post('/export')
	findAll() {
		return this.dataService.export()
	}
}
