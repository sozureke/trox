import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	Query,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'

import { CreateListingDto } from './dto/create.dto'
import { UpdateListingDto } from './dto/update.dto'
import { Category, PromotionType } from './listing.enum'
import { ListingModel } from './listing.model'
import { ListingService } from './listing.service'

import { Auth } from '@auth/decorators/auth.decorator'
import { IdValidationPipe } from '@pipes/id.validation.pipe'
import { RoleEnum } from '@user/user.enum'

@Controller('listing')
export class ListingController {
	constructor(private readonly ListingService: ListingService) {}

	@Post()
	@HttpCode(201)
	@UsePipes(new ValidationPipe())
	@Auth(RoleEnum.USER)
	async createListing(@Body() dto: CreateListingDto): Promise<ListingModel> {
		return await this.ListingService.createListing(dto)
	}

	@Put(':id')
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	@Auth(RoleEnum.USER)
	async updateListing(
		@Body() dto: UpdateListingDto,
		@Param('id', IdValidationPipe) id: string
	): Promise<ListingModel> {
		return await this.ListingService.updateListing(id, dto)
	}

	@Put('/deactivate/:id')
	@HttpCode(200)
	@Auth(RoleEnum.USER)
	async deactivateListing(
		@Param('id', IdValidationPipe) id: string
	): Promise<ListingModel> {
		return await this.ListingService.deactivateListing(id)
	}

	@Put('/reserve/:id')
	@HttpCode(200)
	@Auth(RoleEnum.USER)
	async reserveListing(
		@Param('id', IdValidationPipe) id: string
	): Promise<void> {
		return await this.ListingService.reserveListing(id)
	}

	@Delete(':id')
	@HttpCode(204)
	@Auth(RoleEnum.USER)
	async deleteListing(
		@Param('id', IdValidationPipe) id: string
	): Promise<void> {
		await this.ListingService.deleteListing(id)
	}

	@Delete('/all')
	@HttpCode(204)
	@Auth(RoleEnum.ADMIN)
	async deleteAllListings(): Promise<void> {
		await this.ListingService.deleteAllListings()
	}

	@Get()
	@HttpCode(200)
	async getAllListings(): Promise<ListingModel[]> {
		return await this.ListingService.getAllListings()
	}

	@Get('/search/:keyword')
	@HttpCode(200)
	async searchListings(
		@Query('keyword') keyword: string
	): Promise<ListingModel[]> {
		return await this.ListingService.searchListings(keyword)
	}

	@Get('/filter')
	@HttpCode(200)
	async filterListings(@Body() filter: any): Promise<ListingModel[]> {
		return await this.ListingService.filterListings(filter)
	}

	@Get('id/:id')
	@HttpCode(200)
	@Auth(RoleEnum.ADMIN)
	async getListingById(
		@Param('id', IdValidationPipe) id: string
	): Promise<ListingModel> {
		return await this.ListingService.getListingById(id)
	}

	@Get('/seller/:id')
	@HttpCode(200)
	@Auth(RoleEnum.ADMIN)
	async getListingsBySellerId(
		@Param('id', IdValidationPipe) id: string
	): Promise<ListingModel[]> {
		return await this.ListingService.getListingBySellerId(id)
	}

	@Get('/active')
	@HttpCode(200)
	@Auth(RoleEnum.USER)
	async getActiveListings(): Promise<ListingModel[]> {
		return await this.ListingService.getActiveListings()
	}

	@Get('/sold')
	@HttpCode(200)
	@Auth(RoleEnum.USER)
	async getSoldListings(): Promise<ListingModel[]> {
		return await this.ListingService.getSoldListings()
	}

	@Get('/category/:category')
	@HttpCode(200)
	async getListingsByCategory(
		@Param('category') category: Category
	): Promise<ListingModel[]> {
		return await this.ListingService.getListingsByCategory(category)
	}

	@Get('/promotion/:promotion')
	@HttpCode(200)
	async getListingsByPromotion(
		@Param('promotion') promotion: PromotionType
	): Promise<ListingModel[]> {
		return await this.ListingService.getListingsByPromotion(promotion)
	}

	@Get('/popular')
	@HttpCode(200)
	async getPopularListings(): Promise<ListingModel[]> {
		return await this.ListingService.getPopularListings()
	}

	@Get('/new')
	@HttpCode(200)
	async getNewListings(): Promise<ListingModel[]> {
		return await this.ListingService.getNewListings()
	}
}
