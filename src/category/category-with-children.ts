import { Category } from '@prisma/client'

export type CategoryTree = Category & {
	children: CategoryTree[]
}
