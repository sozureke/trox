import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UserModule } from '@user/user.module'
import { TypegooseModule } from 'nestjs-typegoose'
import { BanController } from './ban.controller'
import { BanModel } from './ban.model'
import { BanService } from './ban.service'

@Module({
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: BanModel,
				schemaOptions: {
					collection: 'Ban'
				}
			}
		]),
		ConfigModule,
		forwardRef(() => UserModule)
	],
	providers: [BanService],
	controllers: [BanController],
	exports: [TypegooseModule.forFeature([BanModel]), BanService]
})
export class BanModule {}
