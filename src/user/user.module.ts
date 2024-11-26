import { BanModule } from '@ban/ban.module'
import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { RatingModule } from '@rating/rating.module'
import { TypegooseModule } from 'nestjs-typegoose'
import { UserController } from './user.controller'
import { UserModel } from './user.model'
import { UserService } from './user.service'

@Module({
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: UserModel,
				schemaOptions: {
					collection: 'User'
				}
			}
		]),
		forwardRef(() => RatingModule),
		forwardRef(() => BanModule),
		ConfigModule
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [TypegooseModule.forFeature([UserModel]), UserService]
})
export class UserModule {}
