import {
	IsBoolean,
	IsDate,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min
} from 'class-validator'

export class SetBanDto {
	@IsString()
	@IsNotEmpty()
	user_id: string

	@IsString()
	@IsNotEmpty()
	@Min(20)
	@Max(200)
	reason: string

	@IsString()
	@IsNotEmpty()
	@Min(20)
	@Max(200)
	additional_notes: string

	@IsString()
	@IsOptional()
	admin_id?: string

	@IsDate()
	@IsNotEmpty()
	ban_start: Date

	@IsDate()
	@IsNotEmpty()
	ban_end: Date

	@IsNumber()
	@IsNotEmpty()
	@Min(0)
	duration: number

	@IsBoolean()
	@IsNotEmpty()
	isActive: boolean
}
