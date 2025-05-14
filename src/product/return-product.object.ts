import { Prisma } from '@prisma/client'
import { returnCategoryObject } from 'src/category/return-category.object'
import { featureReturnObject } from 'src/feature/return-feature.object'
import { propertyReturnObject } from 'src/property/return-property.object'
import { returnReviewObject } from 'src/review/return-review.object'

export const productReturnObject: Prisma.ProductSelect = {
	images: true,
	description: true,
	id: true,
	name: true,
	price: true,
	createAt: true,
	slug: true,
	category: { select: returnCategoryObject },
	manufacturer: true,
	reviews: { select: returnReviewObject, orderBy: { createAt: 'desc' } },
	features: { select: featureReturnObject },
	properties: { select: propertyReturnObject }
}

export const productReturnObjectFullest: Prisma.ProductSelect = {
	...productReturnObject
}
