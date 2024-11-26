import { IsNotEmpty, IsString, Max, Min } from 'class-validator'

export class CreateReviewDto {
	@IsString()
	@IsNotEmpty()
	review_on: string

	@IsString()
	@IsNotEmpty()
	review_by: string

	@IsString()
	@IsNotEmpty()
	@Max(500)
	@Min(100)
	content: string

	@IsNotEmpty()
	@Max(5.0)
	@Min(1.0)
	ratingValue: number
}
