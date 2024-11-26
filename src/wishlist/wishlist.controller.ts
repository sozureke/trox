import { ListingModel } from '@listing/listing.model'
import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	Post,
	Put
} from '@nestjs/common'
import { Ref } from '@typegoose/typegoose'
import { CreateWishlistDto } from './dto/create.dto'
import { WishlistModel } from './wishlist.model'
import { WishlistService } from './wishlist.service'

@Controller('wishlist')
export class WishlistController {
	constructor(private readonly wishlistService: WishlistService) {}

	@Post()
	@HttpCode(201)
	async createWishlist(@Body() dto: CreateWishlistDto): Promise<WishlistModel> {
		return this.wishlistService.createWishlist(dto)
	}

	@Put(':wishlistId/listing/:listingId')
	@HttpCode(200)
	async addListing(
		@Param('wishlistId') wishlistId: string,
		@Param('listingId') listingId: string
	): Promise<WishlistModel> {
		return this.wishlistService.addListingToWishlist(wishlistId, listingId)
	}

	@Put(':wishlistId/listing/:listingId/remove')
	@HttpCode(200)
	async removeListing(
		@Param('wishlistId') wishlistId: string,
		@Param('listingId') listingId: string
	): Promise<WishlistModel> {
		return this.wishlistService.removeListingFromWishlist(wishlistId, listingId)
	}

	@Put(':wishlistId/listing/remove-all')
	@HttpCode(200)
	async clearWishlist(
		@Param('wishlistId') wishlistId: string
	): Promise<WishlistModel> {
		return this.wishlistService.removeAllListingsFromWishlist(wishlistId)
	}

	@Get(':wishlistId/listings')
	@HttpCode(200)
	async getWishlistListings(
		@Param('wishlistId') wishlistId: string
	): Promise<Ref<ListingModel>[]> {
		return this.wishlistService.getListingsInWishlist(wishlistId)
	}

	@Get(':wishlistId/listings/count')
	@HttpCode(200)
	async getWishlistCount(
		@Param('wishlistId') wishlistId: string
	): Promise<number> {
		return this.wishlistService.getListingCountInWishlist(wishlistId)
	}
}
