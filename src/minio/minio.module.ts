import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Client } from 'minio'
import { MINIO_TOKEN } from './minio.decorator'

@Global()
@Module({
	exports: [MINIO_TOKEN],
	providers: [
		{
			inject: [ConfigService],
			provide: MINIO_TOKEN,
			useFactory: async (configService: ConfigService): Promise<Client> => {
				const client = new Client({
					endPoint: configService.getOrThrow('MINIO_ENDPOINT'),
					port: +configService.getOrThrow('MINIO_PORT'),
					accessKey: configService.getOrThrow('MINIO_ACCESS_KEY'),
					secretKey: configService.getOrThrow('MINIO_SECRET_KEY'),
					useSSL: configService.get('MINIO_USE_SSL') === 'true'
				})

				const bucket = configService.getOrThrow('MINIO_BUCKET')

				const exists = await client.bucketExists(bucket)
				if (!exists) {
					await client.makeBucket(bucket, 'us-east-1')
				}
				return client
			}
		}
	]
})
export class MinioModule {}
