import { prop, Ref } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { UserModel } from '@user/user.model'

export interface BanModel extends Base {}

export class BanModel extends TimeStamps {
	@prop({ required: true, ref: () => UserModel, index: true })
	userId: Ref<UserModel>

	@prop({ required: true, minlength: 10, maxlength: 200 })
	reason: string

	@prop({ required: false, maxlength: 200 })
	additionalNotes?: string

	@prop({ ref: () => UserModel })
	adminId?: Ref<UserModel>

	@prop({ required: true, default: () => new Date() })
	banStart: Date

	@prop({ required: true })
	banEnd: Date

	@prop({ required: true, default: true, index: true })
	isActive: boolean

	@prop({ required: true, min: 1 })
	duration: number
}
