import { ListingModel } from '@listing/listing.model'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ModelType, Ref } from '@typegoose/typegoose/lib/types'
import { handleError, handleNoRecords } from '@utils/handle_error'
import { Types } from 'mongoose'
import { InjectModel } from 'nestjs-typegoose'
import { CreateWishlistDto } from './dto/create.dto'
import { WishlistModel } from './wishlist.model'

@Injectable()
export class WishlistService {
	private readonly logger = new Logger(WishlistService.name)

	constructor(
		@InjectModel(WishlistModel)
		private readonly WishlistModel: ModelType<WishlistModel>
	) {}

	async createWishlist(dto: CreateWishlistDto): Promise<WishlistModel> {
		try {
			const existingWishlist = await this.WishlistModel.findOne({
				userId: dto.userId
			})
			if (existingWishlist) {
				this.logger.error(`Wishlist already exists for user ${dto.userId}`)
				throw new BadRequestException('Wishlist already exists')
			}
			this.logger.log(`Creating wishlist for user ${dto.userId}`)
			return await this.WishlistModel.create(dto)
		} catch (error) {
			handleError('Error creating wishlist', error, this.logger)
		}
	}

	async addListingToWishlist(
		wishlistId: string,
		listingId: string
	): Promise<WishlistModel> {
		try {
			const wishlist = await this.WishlistModel.findById(wishlistId)
			if (!wishlist) {
				handleNoRecords(
					`Wishlist with id: ${wishlistId} does not exist`,
					this.logger
				)
			}

			const listingObjectId = new Types.ObjectId(listingId)
			if (
				wishlist.listings.some(id =>
					(id as Types.ObjectId).equals(listingObjectId)
				)
			) {
				this.logger.warn(
					`Listing ${listingId} already in wishlist ${wishlistId}`
				)
				return
			} else {
				wishlist.listings.push(listingObjectId as Ref<ListingModel>)
				await wishlist.save()
			}

			this.logger.log(`Added listing ${listingId} to wishlist ${wishlistId}`)
			return wishlist
		} catch (error) {
			handleError('Error adding item to wishlist', error, this.logger)
		}
	}

	async removeListingFromWishlist(
		wishlistId: string,
		listingId: string
	): Promise<WishlistModel> {
		try {
			const listingObjectId = new Types.ObjectId(listingId)
			const wishlist = await this.WishlistModel.findByIdAndUpdate(
				wishlistId,
				{ $pull: { listings: listingObjectId } },
				{ new: true }
			)
			if (!wishlist) {
				handleNoRecords(
					`Wishlist with id: ${wishlistId} does not exist`,
					this.logger
				)
			}

			this.logger.log(
				`Removed listing ${listingId} from wishlist ${wishlistId}`
			)
			return wishlist
		} catch (error) {
			handleError('Error removing item from wishlist', error, this.logger)
		}
	}

	async removeAllListingsFromWishlist(
		wishlistId: string
	): Promise<WishlistModel> {
		try {
			const wishlist = await this.WishlistModel.findByIdAndUpdate(
				wishlistId,
				{ listings: [] },
				{ new: true }
			)
			if (!wishlist) {
				handleNoRecords('Wishlist does not exist', this.logger)
			}

			this.logger.log(`All items removed from wishlist ${wishlistId}`)
			return wishlist
		} catch (error) {
			handleError('Error removing all items from wishlist', error, this.logger)
		}
	}

	async getListingsInWishlist(
		wishlistId: string
	): Promise<Ref<ListingModel>[]> {
		try {
			const wishlist =
				await this.WishlistModel.findById(wishlistId).populate('listings')
			if (!wishlist) {
				handleNoRecords('Wishlist does not exist', this.logger)
			}
			return wishlist.listings
		} catch (error) {
			handleError('Error fetching wishlist items', error, this.logger)
		}
	}

	async getListingCountInWishlist(wishlistId: string): Promise<number> {
		try {
			const wishlist = await this.WishlistModel.findById(wishlistId)
			if (!wishlist) {
				handleNoRecords('Wishlist does not exist', this.logger)
			}
			return wishlist.listings.length
		} catch (error) {
			handleError('Error fetching number of wishlist items', error, this.logger)
		}
	}
}
