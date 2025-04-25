import { Module } from '@nestjs/common'
import { ArchiveService } from './archive.service'
import { DataController } from './data.controller'
import { DataService } from './data.service'

@Module({
	controllers: [DataController],
	providers: [DataService, ArchiveService]
})
export class DataModule {}
