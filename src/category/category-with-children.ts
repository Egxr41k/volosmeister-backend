import { Category } from '@prisma/client'

export type CategoryWithChildren = Category & {
	children: Category[]
}

export type CategoryTree = Category & {
	children: CategoryTree[]
}
