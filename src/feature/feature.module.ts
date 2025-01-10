import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { FeatureService } from './feature.service'

@Module({
	providers: [FeatureService, PrismaService],
	exports: [FeatureService]
})
export class FeatureModule {}
