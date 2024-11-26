import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	Min
} from 'class-validator'
import { Category, Condition, PromotionType } from '../listing.enum'

export class FilterListingsDto {
	@IsOptional()
	@IsEnum(Category)
	category?: Category

	@IsOptional()
	@IsNumber()
	@Min(0)
	minPrice?: number

	@IsOptional()
	@IsNumber()
	@Min(0)
	maxPrice?: number

	@IsOptional()
	@IsEnum(Condition)
	condition?: Condition

	@IsOptional()
	@IsBoolean()
	isActive?: boolean

	@IsOptional()
	@IsEnum(PromotionType)
	promotionType?: PromotionType

	@IsOptional()
	@IsString()
	keyword?: string

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	tags?: string[]
}
