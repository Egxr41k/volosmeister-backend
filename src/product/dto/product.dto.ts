import { Prisma } from '@prisma/client'
import { ArrayMinSize, IsNumber, IsOptional, IsString } from 'class-validator'

export class ProductDto implements Prisma.ProductUpdateInput {
	@IsString()
	name: string

	@IsNumber({}, { each: true })
	@ArrayMinSize(1)
	prices: number[]

	@IsString({ each: true })
	@ArrayMinSize(1)
	sizes: string[]

	@IsOptional()
	@IsString()
	description: string

	@IsOptional()
	@IsString()
	instructionForUse: string

	@IsString({ each: true })
	@ArrayMinSize(1)
	images: string[]

	@IsString({ each: true })
	@IsOptional()
	ingredients?: string[]

	@IsString()
	categoryName: string

	@IsString()
	manufacturerName: string
}
