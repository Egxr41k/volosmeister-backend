import { Feature, Product, Property } from '@prisma/client'

interface ProductDto extends Product {
	features: Feature[]
	properties: Property[]
}

export default ProductDto
