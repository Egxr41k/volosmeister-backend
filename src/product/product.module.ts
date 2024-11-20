import { Module } from '@nestjs/common'
import { FeatureService } from 'src/feature/feature.service'
import { PaginationService } from 'src/pagination/pagination.service'
import { PrismaService } from 'src/prisma.service'
import { PropertyService } from 'src/property/property.service'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'

@Module({
	controllers: [ProductController],
	providers: [
		ProductService,
		PaginationService,
		FeatureService,
		PropertyService,
		PrismaService
	]
})
export class ProductModule {}
