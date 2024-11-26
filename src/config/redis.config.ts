// import { CacheModuleAsyncOptions } from '@nestjs/cache-manager'
// import { ConfigService } from '@nestjs/config'
// import * as redisStore from 'cache-manager-ioredis'

// export const RedisOptions: CacheModuleAsyncOptions = {
// 	isGlobal: true,
// 	inject: [ConfigService],
// 	useFactory: async (configService: ConfigService) => ({
// 		store: redisStore,
// 		host: configService.get<string>('REDIS_HOST'),
// 		port: configService.get<number>('REDIS_PORT')
// 	})
// }
