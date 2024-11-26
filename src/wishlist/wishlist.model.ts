import { ListingModel } from '@listing/listing.model'
import { prop, Ref } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

export interface WishlistModel extends Base {}
export class WishlistModel extends TimeStamps {
	@prop({ required: true })
	userId: string

	@prop({ ref: () => ListingModel, default: [] })
	listings: Ref<ListingModel>[]
}
