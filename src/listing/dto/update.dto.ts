import { PartialType } from '@nestjs/mapped-types'
import { CreateListingDto } from './create.dto'

export class UpdateListingDto extends PartialType(CreateListingDto) {}
