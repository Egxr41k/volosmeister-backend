import {
	Controller,
	Post,
	Res,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { rm } from 'fs/promises'
import { DataService } from './data.service'

@Controller('data')
export class DataController {
	constructor(private readonly dataService: DataService) {}

	@Post('import')
	@UseInterceptors(FileInterceptor('file'))
	async import(@UploadedFile() file: Express.Multer.File) {
		return await this.dataService.import(file)
	}

	@Post('export')
	async exportData(@Res() res: Response) {
		const zipPath = await this.dataService.export()

		res.download(zipPath, async () => {
			// Можно добавить удаление временного файла после отправки
			await rm(zipPath)
		})
	}
}
