import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { Product } from '@prisma/client'
import { ProductService } from './product.service'

@Controller('products')
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	@Get()
	async getProducts() {
		return this.productService.getProducts()
	}

	@Get(':id')
	async getProduct(@Param('id') id: number) {
		return this.productService.getProduct(id)
	}

	@Post()
	async createProduct(@Body() productData: Product) {
		return this.productService.createProduct(productData)
	}

	@Put(':id')
	async updateProduct(
		@Param('id') id: number,
		@Body() updatedProduct: Product
	) {
		return this.productService.updateProduct(id, updatedProduct)
	}

	@Delete(':id')
	async deleteProduct(@Param('id') id: number): Promise<void> {
		return this.productService.deleteProduct(id)
	}
}
