import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ConversationModel } from './conversation.model'
import { ModelType } from '@typegoose/typegoose/lib/types'

@Injectable()
export class ConversationService {}
