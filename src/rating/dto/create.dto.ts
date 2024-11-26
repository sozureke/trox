import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator'

export class CreateRatingDto {
	@IsString()
	@IsNotEmpty()
	userId: string

	@IsNumber()
	@IsNotEmpty()
	@Min(0)
	@Max(5)
	ratingValue: number

	@IsString({ each: true })
	@IsNotEmpty({ each: true })
	reviews: string[]
}
