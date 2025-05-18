import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

type AvailableTablesForIdReset =
	| 'Product'
	| 'Category'
	| 'Manufacturer'
	| 'User'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	async onModuleInit() {
		await this.$connect()
	}

	async resetIdSequenceFor(tableName: AvailableTablesForIdReset) {
		const [{ max }] = await this.$queryRawUnsafe<{ max: number }[]>(
			`SELECT MAX(id) FROM "${tableName}"`
		)
		const nextId = (max ?? 0) + 1
		await this.$executeRawUnsafe(
			`ALTER SEQUENCE "${tableName}_id_seq" RESTART WITH ${nextId}`
		)
	}
}
