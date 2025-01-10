import { Prisma } from '@prisma/client'
import { IsString } from 'class-validator'

export class PropertyDto implements Prisma.PropertyUpdateInput {
	@IsString()
	name: string

	@IsString()
	value: string
}
