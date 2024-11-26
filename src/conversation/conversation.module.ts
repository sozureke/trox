import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypegooseModule } from 'nestjs-typegoose'
import { ConversationController } from './conversation.controller'
import { ConversationModel } from './conversation.model'
import { ConversationService } from './conversation.service'

@Module({
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: ConversationModel,
				schemaOptions: {
					collection: 'Conversation'
				}
			}
		]),
		ConfigModule
	],
	providers: [ConversationService],
	controllers: [ConversationController],
	exports: [
		TypegooseModule.forFeature([ConversationModel]),
		ConversationService
	]
})
export class ConversationModule {}
