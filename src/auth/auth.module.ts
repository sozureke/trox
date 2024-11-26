import { BanModule } from '@ban/ban.module'
import { getJWTConfig } from '@config/jwt.config'
import { ConversationModule } from '@conversation/conversation.module'
import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { UserModel } from '@user/user.model'
import { UserModule } from '@user/user.module'
import { TypegooseModule } from 'nestjs-typegoose'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

import { GitHubStrategy } from './strategies/github.strategy'
import { GoogleStrategy } from './strategies/google.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
	controllers: [AuthController],
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: UserModel,
				schemaOptions: {
					collection: 'User'
				}
			}
		]),
		forwardRef(() => UserModule),
		BanModule,
		ConversationModule,
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJWTConfig
		}),
		PassportModule.register({ defaultStrategy: 'jwt' })
	],
	providers: [AuthService, JwtStrategy, GoogleStrategy, GitHubStrategy]
})
export class AuthModule {}
