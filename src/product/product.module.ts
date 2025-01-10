import { Module } from '@nestjs/common'
import { CategoryModule } from 'src/category/category.module'
import { FeatureService } from 'src/feature/feature.service'
import { PaginationModule } from 'src/pagination/pagination.module'
import { PaginationService } from 'src/pagination/pagination.service'
import { PrismaService } from 'src/prisma.service'
import { PropertyService } from 'src/property/property.service'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'

@Module({
	controllers: [ProductController],
	imports: [PaginationModule, CategoryModule],
	providers: [
		ProductService,
		PrismaService,
		PaginationService,
		FeatureService,
		PropertyService
	]
})
export class ProductModule {}
