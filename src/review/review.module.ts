import { Module } from '@nestjs/common'
import { CategoryModule } from 'src/category/category.module'
import { FeatureModule } from 'src/feature/feature.module'
import { ManufacturerModule } from 'src/manufacturer/manufacturer.module'
import { PrismaService } from 'src/prisma.service'
import { ProductModule } from 'src/product/product.module'
import { ProductService } from 'src/product/product.service'
import { PropertyModule } from 'src/property/property.module'
import { ReviewController } from './review.controller'
import { ReviewService } from './review.service'

@Module({
	controllers: [ReviewController],
	providers: [ReviewService, PrismaService, ProductService],
	imports: [
		ProductModule,
		CategoryModule,
		ManufacturerModule,
		FeatureModule,
		PropertyModule
	]
})
export class ReviewModule {}
