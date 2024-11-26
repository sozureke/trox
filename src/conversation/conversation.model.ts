import { prop, Ref } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { UserModel } from '@user/user.model'

export interface ConversationModel extends Base {}

export class ConversationModel extends TimeStamps {
	@prop({ required: true, ref: () => UserModel })
	participants: Ref<UserModel>[]

	@prop({ default: [], ref: () => MessageModel })
	messages: Ref<MessageModel>[]

	@prop({ default: Date.now })
	lastMessageAt: Date
}

export interface MessageModel extends Base {}
export class MessageModel extends TimeStamps {
	@prop({ required: true, ref: () => UserModel })
	sender: Ref<UserModel>

	@prop({ required: true })
	content: string

	@prop({ default: Date.now })
	createdAt: Date
}
