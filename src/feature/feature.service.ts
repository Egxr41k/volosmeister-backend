import { Injectable } from '@nestjs/common'
import { Feature } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { FeatureDto } from './feature.dto'

@Injectable()
export class FeatureService {
	constructor(private prisma: PrismaService) {}

	async updateMany(productId: number, newFeatures: FeatureDto[]) {
		const oldFeatures = await this.prisma.feature.findMany({
			where: { productId }
		})

		// Обновляем старые данные
		await this.updateExistingFeatures(oldFeatures, newFeatures)

		if (oldFeatures.length < newFeatures.length) {
			// Добавляем оставшиеся новые
			const remainingFeatures = newFeatures.slice(oldFeatures.length)
			for (const feature of remainingFeatures) {
				await this.create(productId, feature)
			}
		} else if (oldFeatures.length > newFeatures.length) {
			// Удаляем оставшиеся старые
			const remainingFeatures = oldFeatures.slice(newFeatures.length)
			for (const feature of remainingFeatures) {
				this.remove(feature.id)
			}
		}
	}

	// Обновляем старые данные
	private async updateExistingFeatures(
		existingFeatures: Feature[],
		newFeatures: FeatureDto[]
	) {
		const limit = Math.min(existingFeatures.length, newFeatures.length)
		for (let i = 0; i < limit; i++) {
			await this.update(existingFeatures[i].id, newFeatures[i])
		}
	}

	async update(id: number, updateFeatureDto: FeatureDto) {
		return await this.prisma.feature.update({
			where: { id },
			data: updateFeatureDto
		})
	}

	async create(productId: number, feature: FeatureDto) {
		return await this.prisma.feature.create({
			data: {
				...feature,
				productId
			}
		})
	}

	async remove(id: number) {
		return await this.prisma.feature.delete({
			where: { id }
		})
	}
}
