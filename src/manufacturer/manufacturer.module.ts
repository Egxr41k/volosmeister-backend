import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { ManufacturerController } from './manufacturer.controller'
import { ManufacturerService } from './manufacturer.service'

@Module({
	controllers: [ManufacturerController],
	providers: [ManufacturerService, PrismaService]
})
export class ManufacturerModule {}
