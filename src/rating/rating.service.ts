import { Injectable, Logger } from '@nestjs/common'
import { ReviewService } from '@review/review.service'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { UserModel } from '@user/user.model'
import { handleError, handleNoRecords } from '@utils/handle_error'
import { ensureUserExistsById } from '@utils/user.utils'
import { InjectModel } from 'nestjs-typegoose'
import { CreateRatingDto } from './dto/create.dto'
import { UpdateRatingDto } from './dto/update.dto'
import { RatingModel } from './rating.model'

@Injectable()
export class RatingService {
	private readonly logger = new Logger(RatingService.name)
	constructor(
		@InjectModel(RatingModel)
		private readonly RatingModel: ModelType<RatingModel>,
		@InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>,
		private readonly ReviewService: ReviewService
	) {}

	private async calculateAverageRating(ratingId: string): Promise<number> {
		try {
			const rating =
				await this.RatingModel.findById(ratingId).populate('reviews')
			if (!rating || !rating.reviews || rating.reviews.length === 0) {
				this.logger.log('No reviews found for rating')
				return 0
			}

			const reviewsIds = rating.reviews.map(review => review.toString())
			const reviews = await Promise.all(
				reviewsIds.map(id => this.ReviewService.getReviewById(id))
			)

			const totalScore = reviews.reduce(
				(sum, reviews) => sum + reviews.ratingValue,
				0
			)
			const averageRating = reviews.length ? totalScore / reviews.length : 0

			this.logger.log(
				`Average rating calculated for rating with id: ${ratingId}`
			)
			return averageRating
		} catch (error) {
			handleError('Error calculating average rating', error, this.logger)
		}
	}

	async createRating(dto: CreateRatingDto): Promise<RatingModel> {
		await ensureUserExistsById(dto.userId, this.UserModel, this.logger)
		try {
			const rating = await this.RatingModel.create(dto)
			this.logger.log(`Rating created for user with id: ${dto.userId}`)
			return rating
		} catch (error) {
			handleError('Error creating rating', error, this.logger)
		}
	}

	async updateRating(id: string, dto: UpdateRatingDto): Promise<RatingModel> {
		await ensureUserExistsById(dto.userId, this.UserModel, this.logger)
		try {
			const averageRating = await this.calculateAverageRating(id)
			const updatedRating = await this.RatingModel.findByIdAndUpdate(
				id,
				{ ...dto, ratingValue: averageRating },
				{
					new: true,
					runValidators: true
				}
			).exec()
			if (!updatedRating) handleNoRecords('Rating not found', this.logger)

			this.logger.log(`Rating with id: ${id} updated`)
			return updatedRating
		} catch (error) {
			handleError('Error updating rating', error, this.logger)
		}
	}

	async deleteRating(id: string): Promise<void> {
		try {
			const deletedRating = await this.RatingModel.findByIdAndDelete(id).exec()
			if (!deletedRating) handleNoRecords('Rating not found', this.logger)

			this.logger.log(`Rating with id: ${id} deleted`)
		} catch (error) {
			handleError('Error deleting rating', error, this.logger)
		}
	}

	async getRatingById(id: string): Promise<RatingModel> {
		try {
			const rating = await this.RatingModel.findById(id).exec()
			if (!rating) handleNoRecords('Rating not found', this.logger)

			this.logger.log(`Rating with id: ${id} found`)
			return rating
		} catch (error) {
			handleError('Error getting rating', error, this.logger)
		}
	}

	async getRatingsByUserId(userId: string): Promise<RatingModel[]> {
		await ensureUserExistsById(userId, this.UserModel, this.logger)
		try {
			const ratings = await this.RatingModel.find({ userId }).exec()
			if (!ratings || ratings.length === 0)
				handleNoRecords('Ratings not found', this.logger)

			this.logger.log(`Ratings for user with id: ${userId} found`)
			return ratings
		} catch (error) {
			handleError('Error getting ratings', error, this.logger)
		}
	}
}
