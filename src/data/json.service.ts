import { Injectable } from '@nestjs/common'
import { Category, Manufacturer, Product } from '@prisma/client'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { JSON_FILE_NAMES, JsonFileName } from './constants'

@Injectable()
export class JsonService {
	async readProducts(outputDir: string) {
		return await this.readFileAs<Product[]>(outputDir, JSON_FILE_NAMES.PRODUCTS)
	}

	async readCategories(outputDir: string) {
		return await this.readFileAs<Category[]>(
			outputDir,
			JSON_FILE_NAMES.CATEGORIES
		)
	}

	async readManufacturers(outputDir: string) {
		return await this.readFileAs<Manufacturer[]>(
			outputDir,
			JSON_FILE_NAMES.MANUFACTURERS
		)
	}

	async readFileAs<T>(outputDir: string, name: JsonFileName): Promise<T> {
		const filename = JSON_FILE_NAMES[name]
		const filePath = join(outputDir, name)
		const data = await readFile(filePath)
		return await this.JsonParseAs<T>(data)
	}

	async JsonParseAs<T>(buffer: Buffer): Promise<T> {
		try {
			return JSON.parse(buffer.toString()) as T
		} catch (e) {
			throw new Error('Invalid JSON')
		}
	}

	async writeProducts(outputDir: string, data: Product[]): Promise<void> {
		return await this.writeFileAs<Product[]>(
			outputDir,
			JSON_FILE_NAMES.PRODUCTS,
			data
		)
	}

	async writeCategories(outputDir: string, data: Category[]): Promise<void> {
		return await this.writeFileAs<Category[]>(
			outputDir,
			JSON_FILE_NAMES.CATEGORIES,
			data
		)
	}

	async writeManufacturers(
		outputDir: string,
		data: Manufacturer[]
	): Promise<void> {
		return await this.writeFileAs<Manufacturer[]>(
			outputDir,
			JSON_FILE_NAMES.MANUFACTURERS,
			data
		)
	}

	async writeFileAs<T>(
		outputDir: string,
		name: JsonFileName,
		data: T
	): Promise<void> {
		const filename = JSON_FILE_NAMES[name]
		const filePath = join(outputDir, filename)
		const jsonString = await this.JsonStringifyAs<T>(data)
		await writeFile(filePath, jsonString)
	}

	async JsonStringifyAs<T>(data: T): Promise<string> {
		try {
			return JSON.stringify(data, null, 2)
		} catch (e) {
			throw new Error('Invalid JSON')
		}
	}
}
