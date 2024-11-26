import { IsNotEmpty, IsString } from 'class-validator'

export class CreateWishlistDto {
	@IsString()
	@IsNotEmpty()
	userId: string

	@IsString({ each: true })
	listings: string[]
}
