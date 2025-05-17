import { Module } from '@nestjs/common'
import { CategoryModule } from 'src/category/category.module'
import { ManufacturerModule } from 'src/manufacturer/manufacturer.module'
import { MinioModule } from 'src/minio/minio.module'
import { ProductModule } from 'src/product/product.module'
import { UserModule } from 'src/user/user.module'
import { ArchiveService } from './archive.service'
import { DataController } from './data.controller'
import { DataService } from './data.service'
import { ImageService } from './image.service'
import { JsonService } from './json.service'

@Module({
	imports: [
		MinioModule,
		CategoryModule,
		ManufacturerModule,
		UserModule,
		ProductModule
	],
	controllers: [DataController],
	providers: [DataService, ArchiveService, ImageService, JsonService]
})
export class DataModule {}
