import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import ProductDto from './dto/product.dto'
import { ProductService } from './product.service'

@Controller('products')
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	@Get()
	async getProducts() {
		return this.productService.getProducts()
	}

	@Get(':id')
	async getProduct(@Param('id') id: string) {
		return this.productService.getProduct(+id)
	}

	@Post('/create')
	async createProduct() {
		return this.productService.createProduct()
	}

	@Put('/update/:id')
	async updateProduct(
		@Param('id') id: string,
		@Body() updatedProduct: ProductDto
	) {
		return this.productService.updateProduct(updatedProduct)
	}

	@Delete('/delete/:id')
	async deleteProduct(@Param('id') id: string): Promise<void> {
		return this.productService.deleteProduct(+id)
	}
}
