import { Module } from '@nestjs/common'
import { MinioModule } from 'src/minio/minio.module'
import { MinioService } from 'src/minio/minio.service'
import { PrismaService } from 'src/prisma.service'
import { ArchiveService } from './archive.service'
import { DataController } from './data.controller'
import { DataService } from './data.service'
import { ImageService } from './image.service'
import { JsonService } from './json.service'

@Module({
	imports: [MinioModule],
	controllers: [DataController],
	providers: [
		DataService,
		ArchiveService,
		ImageService,
		JsonService,
		PrismaService,
		MinioService
	]
})
export class DataModule {}
