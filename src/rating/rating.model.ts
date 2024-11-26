import { ReviewModel } from '@review/review.model'
import { prop, Ref } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { UserModel } from '@user/user.model'

export interface RatingModel extends Base {}
export class RatingModel extends TimeStamps {
	@prop({ required: true, ref: () => UserModel })
	userId: Ref<UserModel>

	@prop({ required: true, default: 0.0, min: 0.0, max: 5.0 })
	ratingValue: number

	@prop({ required: true, ref: () => ReviewModel, default: [] })
	reviews: Ref<ReviewModel>[]
}
