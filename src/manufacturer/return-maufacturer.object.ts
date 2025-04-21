import { Prisma } from '@prisma/client'

export const returnManufacturerObject: Prisma.ManufacturerSelect = {
	id: true,
	name: true,
	slug: true
}
