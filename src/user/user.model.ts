import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { RoleEnum } from './user.enum'

export interface UserModel extends Base {}
export class UserModel extends TimeStamps {
	@prop({ required: true, unique: true, index: true })
	email: string

	@prop()
	password: string

	@prop({ required: true, maxlength: 50 })
	name: string

	@prop({ default: '' })
	avatar: string

	@prop({ required: true, maxlength: 50 })
	surname: string

	@prop({ match: /^\+?[1-9]\d{1,14}$/, index: true })
	phoneNumber: string

	@prop({ default: RoleEnum.USER, enum: RoleEnum, index: true })
	role: RoleEnum

	@prop({ default: false })
	isBanned: boolean
}
