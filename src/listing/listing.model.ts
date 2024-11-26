import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import {
	Category,
	Condition,
	PromotionType,
	ShippingOptions
} from './listing.enum'

class GeoLocation {
	@prop({ type: String, enum: ['Point'], required: true })
	type: string

	@prop({ type: [Number], required: true })
	coordinates: [number, number]
}

class ListingPromotion {
	promotionType: PromotionType
	promotedUntil: Date
}

class ListingDetails {
	@prop({ required: true, maxlength: 300, minlength: 20 })
	description: string

	@prop({ required: true, default: 0 })
	currentPrice: number

	@prop({ default: 0 })
	oldPrice: number

	@prop({
		required: true,
		enum: Category,
		default: Category.OTHER,
		index: true
	})
	category: Category

	@prop({ required: true, type: () => [String], default: [] })
	images: string[]

	@prop({ required: true, type: () => [String], default: [] })
	tags: string[]

	@prop({ required: true, enum: Condition, default: Condition.NEW })
	condition: Condition

	@prop({ required: true, enum: ShippingOptions })
	shippingOptions: ShippingOptions

	@prop({ required: true })
	location: GeoLocation

	@prop({ required: true })
	promotion: ListingPromotion

	@prop({ required: true, default: true, index: true })
	isActive: boolean

	@prop({ required: true, default: false, index: true })
	isReserved: boolean

	@prop({ required: true, default: false, index: true })
	isSold: boolean
}

class ListingStatistic {
	@prop({ default: 0 })
	numberOfViews: number

	@prop({ default: 0 })
	numberOfFavorites: number

	@prop({ default: 0 })
	numberOfInquiries: number
}

export interface ListingModel extends Base {}
export class ListingModel extends TimeStamps {
	@prop({ required: true, minlengthL: 5, maxlength: 80 })
	title: string

	@prop({ required: true })
	sellerId: string

	@prop({ required: true })
	listingDetails: ListingDetails

	@prop({ required: true })
	listingStatistic: ListingStatistic
}
