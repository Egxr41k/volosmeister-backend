import { Prisma } from '@prisma/client'
import { IsString } from 'class-validator'

export class FeatureDto implements Prisma.FeatureUpdateInput {
	@IsString()
	title: string

	@IsString()
	image: string

	@IsString()
	description: string
}
