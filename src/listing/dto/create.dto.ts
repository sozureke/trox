import { Type } from 'class-transformer'
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Length,
	Max,
	Min,
	ValidateNested
} from 'class-validator'
import {
	Category,
	Condition,
	PromotionType,
	ShippingOptions
} from '../listing.enum'

class GeoLocationDto {
	@IsString()
	@IsNotEmpty()
	@IsEnum(['Point'])
	type: string

	@IsArray()
	@IsNotEmpty()
	@Min(2)
	@Max(2)
	@Type(() => Number)
	coordinates: [number, number]
}

class ListingPromotionDto {
	@IsEnum(PromotionType)
	promotionType: PromotionType

	@IsOptional()
	@Type(() => Date)
	promotedUntil: Date
}

class ListingStatisticDto {
	@IsNumber()
	@IsOptional()
	numberOfViews: number

	@IsNumber()
	@IsOptional()
	numberOfFavorites: number

	@IsNumber()
	@IsOptional()
	numberOfInquiries: number
}

class ListingDetailsDto {
	@IsString()
	@IsNotEmpty()
	@Length(20, 300)
	description: string

	@IsNumber()
	@Min(0)
	currentPrice: number

	@IsNumber()
	@IsOptional()
	@Min(0)
	oldPrice: number

	@IsEnum(Category)
	@IsNotEmpty()
	category: Category

	@IsArray()
	@IsString({ each: true })
	images: string[]

	@IsArray()
	@IsString({ each: true })
	tags: string[]

	@IsEnum(Condition)
	condition: Condition

	@IsEnum(ShippingOptions)
	shippingOptions: ShippingOptions

	@ValidateNested()
	@Type(() => GeoLocationDto)
	location: GeoLocationDto

	@ValidateNested()
	@Type(() => ListingPromotionDto)
	promotion: ListingPromotionDto

	@IsBoolean()
	@IsOptional()
	isActive: boolean

	@IsBoolean()
	@IsOptional()
	isReserved: boolean

	@IsBoolean()
	@IsOptional()
	isSold: boolean
}

export class CreateListingDto {
	@IsString()
	@IsNotEmpty()
	@Length(5, 80)
	title: string

	@IsString()
	@IsNotEmpty()
	sellerId: string

	@ValidateNested()
	@Type(() => ListingDetailsDto)
	listingDetails: ListingDetailsDto

	@ValidateNested()
	@Type(() => ListingStatisticDto)
	listingStatistic: ListingStatisticDto
}
