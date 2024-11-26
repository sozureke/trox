import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ReviewModule } from '@review/review.module'
import { UserModule } from '@user/user.module'
import { TypegooseModule } from 'nestjs-typegoose'
import { RatingController } from './rating.controller'
import { RatingModel } from './rating.model'
import { RatingService } from './rating.service'

@Module({
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: RatingModel,
				schemaOptions: {
					collection: 'Rating'
				}
			}
		]),
		forwardRef(() => UserModule),
		forwardRef(() => ReviewModule),
		ConfigModule
	],
	providers: [RatingService],
	controllers: [RatingController],
	exports: [TypegooseModule.forFeature([RatingModel]), RatingService]
})
export class RatingModule {}
