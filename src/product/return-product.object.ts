import { Prisma } from '@prisma/client'
import { returnCategoryObject } from 'src/category/return-category.object'
import { featureReturnObject } from 'src/feature/return-feature.object'
import { returnManufacturerObject } from 'src/manufacturer/return-maufacturer.object'
import { propertyReturnObject } from 'src/property/return-property.object'
import { returnReviewObject } from 'src/review/return-review.object'

export const productReturnObject: Prisma.ProductSelect = {
	id: true,
	name: true,
	prices: true,
	sizes: true,
	minPrice: true,
	createdAt: true,
	slug: true,
	category: { select: returnCategoryObject },
	manufacturer: { select: returnManufacturerObject },
	images: true,
	description: true,
	instructionForUse: true,
	ingredients: true,
	reviews: { select: returnReviewObject, orderBy: { createdAt: 'desc' } },
	features: { select: featureReturnObject },
	properties: { select: propertyReturnObject }
}

export const productReturnObjectFullest: Prisma.ProductSelect = {
	...productReturnObject
}
