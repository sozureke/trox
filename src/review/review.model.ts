import { prop, Ref } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { UserModel } from '@user/user.model'

export interface ReviewModel extends Base {}
export class ReviewModel extends TimeStamps {
	@prop({ required: true, ref: () => UserModel })
	review_on: Ref<UserModel>

	@prop({ required: true, ref: () => UserModel })
	review_by: Ref<UserModel>

	@prop({ required: true, maxlength: 500, minlength: 100 })
	content: string

	@prop({ required: true, default: 0.0, max: 5.0, min: 1.0 })
	ratingValue: number
}
