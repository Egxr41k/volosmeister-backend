import { Prisma } from '@prisma/client'

export const propertyReturnObject: Prisma.PropertySelect = {
	name: true,
	value: true
}
