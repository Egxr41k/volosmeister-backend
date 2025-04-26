import { Injectable } from '@nestjs/common'
import { Category, Manufacturer, Product } from '@prisma/client'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { JSON_FILE_NAMES, JsonFileName } from './constants'

@Injectable()
export class JsonService {
	async readProducts(outputDir: string) {
		return this.readFileAs<Product[]>(outputDir, JSON_FILE_NAMES.PRODUCTS)
	}

	async readCategories(outputDir: string) {
		return this.readFileAs<Category[]>(outputDir, JSON_FILE_NAMES.CATEGORIES)
	}

	async readManufacturers(outputDir: string) {
		return this.readFileAs<Manufacturer[]>(
			outputDir,
			JSON_FILE_NAMES.MANUFACTURERS
		)
	}
	async readFileAs<T>(outputDir: string, name: JsonFileName): Promise<T> {
		const filename = JSON_FILE_NAMES[name]
		const filePath = join(outputDir, filename)
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

	async JsonStringifyAs<T>(data: T): Promise<string> {
		try {
			return JSON.stringify(data, null, 2)
		} catch (e) {
			throw new Error('Invalid JSON')
		}
	}
}
