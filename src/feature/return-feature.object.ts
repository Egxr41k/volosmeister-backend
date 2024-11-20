import { Prisma } from '@prisma/client'

export const featureReturnObject: Prisma.FeatureSelect = {
	id: true,
	title: true,
	image: true,
	description: true
}
