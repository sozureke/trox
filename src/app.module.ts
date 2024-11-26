import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import * as redisStore from 'cache-manager-redis-store'
import { TypegooseModule } from 'nestjs-typegoose'
import { AppResolver } from './app.resolver'
import { AuthModule } from './auth/auth.module'
import { BanModule } from './ban/ban.module'
import { getMongoConfig } from './config/mongo.config'
import { ConversationModule } from './conversation/conversation.module'
import { ListingModule } from './listing/listing.module'
import { RatingModule } from './rating/rating.module'
import { ReviewModule } from './review/review.module'
import { UserModule } from './user/user.module'
import { WishlistModule } from './wishlist/wishlist.module'

@Module({
	imports: [
		CacheModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				store: redisStore,
				host: configService.get<string>('REDIS_HOST'),
				port: configService.get<number>('REDIS_PORT'),
				ttl: 600
			}),
			isGlobal: true
		}),
		ConfigModule.forRoot(),
		TypegooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getMongoConfig
		}),
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			playground: false,
			autoSchemaFile: true
		}),
		ListingModule,
		WishlistModule,
		UserModule,
		RatingModule,
		ReviewModule,
		BanModule,
		AuthModule,
		ConversationModule
	],
	controllers: [],
	providers: [AppResolver]
})
export class AppModule {}
