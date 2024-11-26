import { Test, TestingModule } from '@nestjs/testing'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { getModelToken } from 'nestjs-typegoose'

import { CreateListingDto } from './dto/create.dto'
import {
	Category,
	Condition,
	PromotionType,
	ShippingOptions
} from './listing.enum'
import { ListingModel } from './listing.model'
import { ListingService } from './listing.service'

const mockListing: CreateListingDto = {
	title: 'Sample Listing',
	sellerId: 'seller123',
	listingDetails: {
		description: 'This is a sample listing description with sufficient length.',
		currentPrice: 100.5,
		oldPrice: 90.3,
		category: Category.ELECTRONICS,
		images: ['image1.jpg', 'image2.jpg'],
		tags: ['electronics', 'gadget'],
		condition: Condition.NEW,
		shippingOptions: ShippingOptions.SHIPPING,
		location: {
			type: 'Point',
			coordinates: [40.7128, -74.006]
		},
		promotion: {
			promotionType: PromotionType.VIP,
			promotedUntil: new Date('2024-12-31')
		},
		isActive: true,
		isReserved: false,
		isSold: false
	},
	listingStatistic: {
		numberOfViews: 10,
		numberOfFavorites: 5,
		numberOfInquiries: 2
	}
}

describe('ListingService', () => {
	let service: ListingService
	let model: ModelType<ListingModel>

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ListingService,
				{
					provide: getModelToken(ListingModel.name),
					useValue: {
						findOne: jest.fn(),
						create: jest.fn(),
						findById: jest.fn(),
						findByIdAndDelete: jest.fn(),
						find: jest.fn()
					}
				}
			]
		}).compile()

		service = module.get<ListingService>(ListingService)
		model = module.get<ModelType<ListingModel>>(
			getModelToken(ListingModel.name)
		)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	describe('createListing', () => {
		it('should create a listing', async () => {
			jest.spyOn(model, 'findOne').mockReturnValue(null)
			jest.spyOn(model, 'create').mockReturnValue(mockListing as any)

			const result = await service.createListing(mockListing)
			expect(result).toEqual(mockListing)
			expect(model.create).toHaveBeenCalledWith(mockListing)
		})

		it('should throw an error if listing already exists', async () => {
			jest.spyOn(model, 'findOne').mockReturnValue(mockListing as any)

			await expect(service.createListing(mockListing)).rejects.toThrow()
			expect(model.create).not.toHaveBeenCalled()
		})
	})
})
