import { Module } from '@nestjs/common'
import { CategoryModule } from 'src/category/category.module'
import { FeatureModule } from 'src/feature/feature.module'
import { ManufacturerModule } from 'src/manufacturer/manufacturer.module'
import { PaginationModule } from 'src/pagination/pagination.module'
import { PrismaService } from 'src/prisma.service'
import { PropertyModule } from 'src/property/property.module'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'

@Module({
	controllers: [ProductController],
	imports: [
		PaginationModule,
		CategoryModule,
		ManufacturerModule,
		PaginationModule,
		CategoryModule,
		ManufacturerModule,
		FeatureModule,
		PropertyModule
	],
	providers: [ProductService, PrismaService],
	exports: [ProductService]
})
export class ProductModule {}
