import { CategoryTree } from './category-with-children'

export function bfsCategoryTree(node: CategoryTree) {
	var queue = [] as CategoryTree[]
	var values = [] as number[]
	queue.push(node)

	while (queue.length > 0) {
		var tempNode = queue.shift()
		values.push(tempNode.id)
		tempNode.children.forEach(child => {
			queue.push(child)
		})
	}

	return values
}
