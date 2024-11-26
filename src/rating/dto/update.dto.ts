import { PartialType } from '@nestjs/mapped-types'
import { CreateRatingDto } from './create.dto'

export class UpdateRatingDto extends PartialType(CreateRatingDto) {}
