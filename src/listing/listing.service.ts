import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'

import { handleError, handleNoRecords } from '@utils/handle_error'
import { CreateListingDto } from './dto/create.dto'
import { FilterListingsDto } from './dto/filter-listing.dto'
import { UpdateListingDto } from './dto/update.dto'
import { Category, PromotionType } from './listing.enum'
import { ListingModel } from './listing.model'

@Injectable()
export class ListingService {
	private readonly logger = new Logger(ListingService.name)

	constructor(
		@InjectModel(ListingModel)
		private readonly ListingModel: ModelType<ListingModel>
	) {}

	private async findAndCheck(
		query: any,
		loggerMessage: string
	): Promise<ListingModel[]> {
		const listings = await this.ListingModel.find(query).exec()

		if (listings.length === 0) {
			handleNoRecords(loggerMessage, this.logger)
		}

		return listings
	}

	async createListing(dto: CreateListingDto): Promise<ListingModel> {
		this.logger.log(`Creating listing with title: ${dto.title}`)

		const existingListing = await this.ListingModel.findOne({
			title: dto.title,
			sellerId: dto.sellerId
		})

		if (existingListing) {
			this.logger.error(`Listing with title: ${dto.title} already exists`)
			throw new BadRequestException('Listing with this title already exists')
		}

		try {
			return await this.ListingModel.create(dto)
		} catch (error) {
			handleError('Error creating listing', error, this.logger)
		}
	}

	async updateListing(
		id: string,
		dto: UpdateListingDto
	): Promise<ListingModel> {
		try {
			const updatedListing = await this.ListingModel.findByIdAndUpdate(
				id,
				dto,
				{ new: true, runValidators: true }
			).exec()

			if (!updatedListing) {
				handleNoRecords(`Listing with id: ${id} not found`, this.logger)
			}

			return updatedListing
		} catch (error) {
			handleError(`Error updating listing with id: ${id}`, error, this.logger)
		}
	}

	async deleteListing(id: string): Promise<void> {
		try {
			const deletedListing =
				await this.ListingModel.findByIdAndDelete(id).exec()
			if (!deletedListing) {
				handleNoRecords(`Listing with id: ${id} not found`, this.logger)
			}
		} catch (error) {
			handleError(`Error deleting listing with id: ${id}`, error, this.logger)
		}
	}

	async deleteAllListings(): Promise<void> {
		try {
			const deletedListings = await this.ListingModel.deleteMany().exec()
			if (deletedListings.deletedCount === 0) {
				handleNoRecords('No listings found to delete', this.logger)
			}
			this.logger.log(`Deleted ${deletedListings.deletedCount} listings`)
		} catch (error) {
			handleError('Error deleting all listings', error, this.logger)
		}
	}

	async deactivateListing(id: string): Promise<ListingModel> {
		try {
			const updatedListing = await this.ListingModel.findByIdAndUpdate(
				id,
				{ isActive: false },
				{ new: true }
			).exec()

			if (!updatedListing) {
				handleNoRecords(`Listing with id: ${id} not found`, this.logger)
			}

			return updatedListing
		} catch (error) {
			handleError(
				`Error deactivating listing with id: ${id}`,
				error,
				this.logger
			)
		}
	}

	async reserveListing(id: string): Promise<void> {
		try {
			const reservedListing = await this.ListingModel.findByIdAndUpdate(
				id,
				{ 'listingDetails.isReserved': true },
				{ new: true }
			).exec()

			if (!reservedListing) {
				handleNoRecords(`Listing with id: ${id} not found`, this.logger)
			}
		} catch (error) {
			handleError(`Error reserving listing with id: ${id}`, error, this.logger)
		}
	}

	async searchListings(keyword: string): Promise<ListingModel[]> {
		try {
			return await this.findAndCheck(
				{
					$or: [
						{ title: { $regex: keyword, $options: 'i' } },
						{ 'listingDetails.description': { $regex: keyword, $options: 'i' } }
					]
				},
				`No listings found for keyword: ${keyword}`
			)
		} catch (error) {
			handleError(
				`Error searching listings for keyword: ${keyword}`,
				error,
				this.logger
			)
		}
	}

	async filterListings(filterDto: FilterListingsDto): Promise<ListingModel[]> {
		try {
			const query = {}

			if (filterDto.category)
				query['listingDetails.category'] = filterDto.category
			if (filterDto.minPrice)
				query['listingDetails.currentPrice'] = { $gte: filterDto.minPrice }
			if (filterDto.maxPrice)
				query['listingDetails.currentPrice'] = {
					...query['listingDetails.currentPrice'],
					$lte: filterDto.maxPrice
				}

			return await this.findAndCheck(
				query,
				'No listings found with the given filters'
			)
		} catch (error) {
			handleError('Error filtering listings', error, this.logger)
		}
	}

	async getListingById(id: string): Promise<ListingModel> {
		try {
			const listing = await this.ListingModel.findById(id).exec()

			if (!listing) {
				handleNoRecords(`Listing with id: ${id} not found`, this.logger)
			}

			return listing
		} catch (error) {
			handleError(`Error fetching listing with id: ${id}`, error, this.logger)
		}
	}

	async getListingBySellerId(sellerId: string): Promise<ListingModel[]> {
		try {
			return await this.findAndCheck(
				{ sellerId },
				`No listings found for seller with id: ${sellerId}`
			)
		} catch (error) {
			handleError(
				`Error fetching listings for seller with id: ${sellerId}`,
				error,
				this.logger
			)
		}
	}

	async getActiveListings(): Promise<ListingModel[]> {
		try {
			return await this.findAndCheck(
				{ isActive: true },
				'No active listings found'
			)
		} catch (error) {
			handleError('Error fetching active listings', error, this.logger)
		}
	}

	async getSoldListings(): Promise<ListingModel[]> {
		try {
			return await this.findAndCheck(
				{ 'listingDetails.isSold': true },
				'No sold listings found'
			)
		} catch (error) {
			handleError('Error fetching sold listings', error, this.logger)
		}
	}

	async getListingsByCategory(category: Category): Promise<ListingModel[]> {
		try {
			return await this.findAndCheck(
				{ 'listingDetails.category': category },
				`No listings found for category: ${category}`
			)
		} catch (error) {
			handleError(
				`Error fetching listings for category: ${category}`,
				error,
				this.logger
			)
		}
	}

	async getListingsByPromotion(
		promotionType: PromotionType
	): Promise<ListingModel[]> {
		try {
			return await this.findAndCheck(
				{ 'listingDetails.promotion.promotionType': promotionType },
				`No listings found for promotion type: ${promotionType}`
			)
		} catch (error) {
			handleError(
				`Error fetching listings for promotion type: ${promotionType}`,
				error,
				this.logger
			)
		}
	}

	async getPopularListings(): Promise<ListingModel[]> {
		try {
			const popularListings = await this.ListingModel.find()
				.sort({ 'listingStatistic.numberOfViews': -1 })
				.limit(8)
				.exec()

			if (popularListings.length === 0) {
				handleNoRecords('No popular listings found', this.logger)
			}

			return popularListings
		} catch (error) {
			handleError('Error fetching popular listings', error, this.logger)
		}
	}

	async getAllListings(): Promise<ListingModel[]> {
		try {
			return await this.findAndCheck({}, 'No records found')
		} catch (error) {
			handleError('Error fetching listings', error, this.logger)
		}
	}

	async getNewListings(limit: number = 10): Promise<ListingModel[]> {
		try {
			const newListings = await this.ListingModel.find()
				.sort({ createdAt: -1 })
				.limit(limit)
				.exec()

			if (newListings.length === 0) {
				handleNoRecords('No new listings found', this.logger)
			}

			return newListings
		} catch (error) {
			handleError('Error fetching new listings', error, this.logger)
		}
	}
}
