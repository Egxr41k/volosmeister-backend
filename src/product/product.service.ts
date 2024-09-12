import { Injectable, NotFoundException } from '@nestjs/common'
import { Product } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import ProductDto from './dto/product.dto'

@Injectable()
export class ProductService {
	constructor(private prisma: PrismaService) {}

	async getProducts() {
		return this.prisma.product.findMany()
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

	async createProduct() {
		return this.prisma.product.create({
			data: {} as Product
		})
	}

	async updateProduct(dto: ProductDto) {
		const { features, properties, id, ...data } = dto

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

		// Handle Features
		for (const feature of features) {
			const { id, ...featureData } = feature
			const existingFeature = product.features.find(x => x.id === feature.id)

			if (!existingFeature) {
				await this.prisma.feature.create({ data: featureData })
			} else {
				await this.prisma.feature.update({
					where: { id },
					data: featureData
				})
			}
		}

		// Delete Features not in the updated list
		for (const existingFeature of product.features) {
			const featureExists = features.some(x => x.id === existingFeature.id)
			if (!featureExists) {
				await this.prisma.feature.delete({
					where: { id: existingFeature.id }
				})
			}
		}

		// Handle Properties
		for (const property of properties) {
			const { id, ...propertyData } = property
			const existingProperty = product.properties.find(
				x => x.id === property.id
			)

			if (!existingProperty) {
				await this.prisma.property.create({ data: propertyData })
			} else {
				await this.prisma.property.update({
					where: { id },
					data: propertyData
				})
			}
		}

		// Delete Properties not in the updated list
		for (const existingProperty of product.properties) {
			const propertyExists = properties.some(x => x.id === existingProperty.id)
			if (!propertyExists) {
				await this.prisma.property.delete({
					where: { id: existingProperty.id }
				})
			}
		}

		return this.prisma.product.update({
			where: { id },
			data: data
		})
	}

	async deleteProduct(id: number) {
		const product = await this.prisma.product.findUnique({
			where: { id },
			include: { properties: true, features: true }
		})

		if (!product) {
			throw new NotFoundException(`Product with ID ${id} not found`)
		}

		await this.prisma.feature.deleteMany({
			where: { productId: id }
		})

		await this.prisma.property.deleteMany({
			where: { productId: id }
		})

		await this.prisma.product.delete({ where: { id } })
	}
}
