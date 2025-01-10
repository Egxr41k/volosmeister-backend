import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { PropertyService } from './property.service'

@Module({
	providers: [PropertyService, PrismaService],
	exports: [PropertyService]
})
export class PropertyModule {}
