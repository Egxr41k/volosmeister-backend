import { Injectable } from '@nestjs/common'
import { ArchiveService } from './archive.service'

@Injectable()
export class DataService {
	constructor(private archiveService: ArchiveService) {}

	async import(archive: Express.Multer.File) {
		const files = await this.archiveService.unzip(archive)
		console.log(files)
		return files
		//..
	}

	async export() {
		this.archiveService.zip()
		//...
	}
}
