import { Injectable } from '@nestjs/common'
import { Manufacturer } from '@prisma/client'
import slug from 'slug'
import { PrismaService } from 'src/prisma.service'
import { ManufacturerDto } from './manufacturer.dto'
import { returnManufacturerObject } from './return-maufacturer.object'

@Injectable()
export class ManufacturerService {
	constructor(private prisma: PrismaService) {}

	async create(dto: ManufacturerDto) {
		return await this.prisma.manufacturer.create({
			data: {
				name: dto.name,
				slug: slug(dto.name)
			}
		})
	}

	async createIfNotExist(manufacturerName: string) {
		const existingManufacturer = await this.prisma.manufacturer.findUnique({
			where: {
				name: manufacturerName
			}
		})
		if (existingManufacturer) {
			return existingManufacturer
		} else {
			return await this.create({ name: manufacturerName } as ManufacturerDto)
		}
	}

	async safeCreateMany(manufacturers: Manufacturer[]) {
		return await Promise.all(
			manufacturers.map(async manufacturer => {
				const existingManufacturer = await this.prisma.manufacturer.findUnique({
					where: { name: manufacturer.name }
				})
				if (existingManufacturer) {
					return existingManufacturer
				} else {
					return await this.prisma.manufacturer.create({
						data: manufacturer
					})
				}
			})
		)
	}

	async forceCreateMany(manufacturers: Manufacturer[]) {
		await this.prisma.manufacturer.deleteMany()
		const manufacturersData = await this.prisma.manufacturer.createMany({
			data: manufacturers
		})
		return manufacturersData
	}

	async getAll() {
		const manufacturers = await this.prisma.manufacturer.findMany({
			select: returnManufacturerObject,
			orderBy: { id: 'asc' }
		})

		if (!manufacturers) {
			throw new Error('Manufacturer not found')
		}

		return manufacturers
	}

	async findOne(id: number) {
		const category = await this.prisma.manufacturer.findUnique({
			where: {
				id
			},
			select: returnManufacturerObject
		})

		if (!category) {
			throw new Error('Manufacturer not found')
		}

		return category
	}

	async bySlug(slug: string) {
		const manufacturer = await this.prisma.manufacturer.findUnique({
			where: {
				slug
			},
			select: returnManufacturerObject
		})
		if (!manufacturer) {
			throw new Error('Manufacturer not found')
		}
		return manufacturer
	}

	async update(id: number, dto: ManufacturerDto) {
		return this.prisma.manufacturer.update({
			where: {
				id
			},
			data: {
				name: dto.name,
				slug: slug(dto.name)
			}
		})
	}

	async remove(id: number) {
		return this.prisma.manufacturer.delete({
			where: {
				id
			}
		})
	}
}
