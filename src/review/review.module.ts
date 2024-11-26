import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UserModule } from '@user/user.module'
import { TypegooseModule } from 'nestjs-typegoose'
import { ReviewController } from './review.controller'
import { ReviewModel } from './review.model'
import { ReviewService } from './review.service'

@Module({
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: ReviewModel,
				schemaOptions: {
					collection: 'Review'
				}
			}
		]),
		forwardRef(() => UserModule),
		ConfigModule
	],
	providers: [ReviewService],
	controllers: [ReviewController],
	exports: [TypegooseModule.forFeature([ReviewModel]), ReviewService]
})
export class ReviewModule {}
