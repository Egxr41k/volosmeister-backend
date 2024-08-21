import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class ProductService {
	constructor(private prisma: PrismaService) {}

	async getProducts() {
		return this.prisma.product.findMany({
			include: {
				properties: true,
				features: true
			}
		})
	}

	async getProduct(id: number) {
		const product = await this.prisma.product.findUnique({
			where: { id },
			include: {
				properties: true,
				features: true
			}
		})

		if (!product) {
			throw new NotFoundException(`Product with ID ${id} not found`)
		}

		return product
	}

	async createProduct(data: Prisma.ProductCreateInput) {
		return this.prisma.product.create({
			data,
			include: {
				properties: true,
				features: true
			}
		})
	}

	async updateProduct(id: number, data: Prisma.ProductUpdateInput) {
		const product = await this.prisma.product.findUnique({ where: { id } })

		if (!product) {
			throw new NotFoundException(`Product with ID ${id} not found`)
		}

		return this.prisma.product.update({
			where: { id },
			data,
			include: {
				properties: true,
				features: true
			}
		})
	}

	async deleteProduct(id: number) {
		const product = await this.prisma.product.findUnique({ where: { id } })

		if (!product) {
			throw new NotFoundException(`Product with ID ${id} not found`)
		}

		await this.prisma.product.delete({ where: { id } })
	}
}
