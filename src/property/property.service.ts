import { Injectable } from '@nestjs/common'
import { Property } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { PropertyDto } from './property.dto'

@Injectable()
export class PropertyService {
	constructor(private prisma: PrismaService) {}

	async updateMany(productId: number, newProperties: PropertyDto[]) {
		const oldProperties = await this.prisma.property.findMany({
			where: { productId }
		})

		// Обновляем старые данные
		await this.updateExistingProperties(oldProperties, newProperties)

		if (oldProperties.length < newProperties.length) {
			// Добавляем оставшиеся новые
			const remainingProperties = newProperties.slice(oldProperties.length)
			for (const property of remainingProperties) {
				await this.create(productId, property)
			}
		} else if (oldProperties.length > newProperties.length) {
			// Удаляем оставшиеся старые
			const remainingProperties = oldProperties.slice(newProperties.length)
			for (const property of remainingProperties) {
				this.remove(property.id)
			}
		}
	}

	// Обновляем старые данные
	private async updateExistingProperties(
		existingProperties: Property[],
		newProperties: PropertyDto[]
	) {
		const limit = Math.min(existingProperties.length, newProperties.length)
		for (let i = 0; i < limit; i++) {
			await this.update(existingProperties[i].id, newProperties[i])
		}
	}

	async update(id: number, updatePropertyDto: PropertyDto) {
		return await this.prisma.property.update({
			where: { id },
			data: updatePropertyDto
		})
	}

	async create(productId: number, property: PropertyDto) {
		return await this.prisma.property.create({
			data: {
				...property,
				productId
			}
		})
	}

	async remove(id: number) {
		return await this.prisma.property.delete({
			where: { id }
		})
	}
}
