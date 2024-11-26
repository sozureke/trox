import { Injectable, Logger } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { UserModel } from '@user/user.model'
import { handleError, handleNoRecords } from '@utils/handle_error'
import { ensureUserExistsById } from '@utils/user.utils'
import { InjectModel } from 'nestjs-typegoose'
import { CreateReviewDto } from './dto/create.dto'
import { UpdateReviewDto } from './dto/update.dto'
import { ReviewModel } from './review.model'

@Injectable()
export class ReviewService {
	private readonly logger = new Logger(ReviewService.name)
	constructor(
		@InjectModel(ReviewModel)
		private readonly ReviewModel: ModelType<ReviewModel>,
		@InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>
	) {}

	async createReview(dto: CreateReviewDto): Promise<ReviewModel> {
		try {
			const review = await this.ReviewModel.create(dto)
			this.logger.log('Review created')
			return review
		} catch (error) {
			handleError('Error creating review', error, this.logger)
		}
	}

	async updateReview(id: string, dto: UpdateReviewDto): Promise<ReviewModel> {
		try {
			const updatedReview = await this.ReviewModel.findByIdAndUpdate(id, dto, {
				new: true,
				runValidators: true
			})
			if (!updatedReview)
				handleNoRecords(`Review with id ${id} not found`, this.logger)

			this.logger.log(`Review with id ${id} updated`)
			return updatedReview
		} catch (error) {
			handleError('Error updating review', error, this.logger)
		}
	}

	async getReviewById(id: string): Promise<ReviewModel> {
		try {
			const review = await this.ReviewModel.findById(id)
			if (!review)
				handleNoRecords(`Review with id ${id} not found`, this.logger)

			this.logger.log(`Review with id ${id} found`)
			return review
		} catch (error) {
			handleError('Error getting review', error, this.logger)
		}
	}

	async deleteReviewById(id: string): Promise<ReviewModel> {
		try {
			const deletedReview = await this.ReviewModel.findByIdAndDelete(id)
			if (!deletedReview)
				handleNoRecords(`Review with id ${id} not found`, this.logger)

			this.logger.log(`Review with id ${id} deleted`)
			return deletedReview
		} catch (error) {
			handleError('Error deleting review', error, this.logger)
		}
	}

	async deleteAllReviewsByUserId(userId: string): Promise<number> {
		await ensureUserExistsById(userId, this.UserModel, this.logger)
		try {
			const { deletedCount } = await this.ReviewModel.deleteMany({
				review_on: userId
			}).exec()
			this.logger.log(
				`Deleted ${deletedCount} reviews for user with id: ${userId}`
			)
			return deletedCount
		} catch (error) {
			handleError('Error deleting reviews', error, this.logger)
		}
	}

	async getReviewsByUser(
		userId: string,
		field: 'review_by' | 'review_on',
		limit?: number
	): Promise<ReviewModel[]> {
		await ensureUserExistsById(userId, this.UserModel, this.logger)
		try {
			const reviews = await this.ReviewModel.find({ [field]: userId })
				.limit(limit)
				.sort({ createdAt: -1, ratingValue: -1 })
				.exec()
			if (!reviews || reviews.length === 0) {
				handleNoRecords(
					`No reviews found for user with id ${userId}`,
					this.logger
				)
			}
			this.logger.log(`Reviews found for user with id ${userId}`)
			return reviews
		} catch (error) {
			handleError('Error getting reviews', error, this.logger)
		}
	}

	async getReviewerReviews(userId: string): Promise<ReviewModel[]> {
		return this.getReviewsByUser(userId, 'review_by')
	}

	async getReviewedReviews(userId: string): Promise<ReviewModel[]> {
		return this.getReviewsByUser(userId, 'review_on')
	}

	async getTotalReviewsCount(userId: string): Promise<number> {
		await ensureUserExistsById(userId, this.UserModel, this.logger)
		try {
			const reviewsCount = await this.ReviewModel.countDocuments({
				review_on: userId
			}).exec()
			if (reviewsCount === 0) handleNoRecords('No reviews found', this.logger)

			this.logger.log(`Reviews count for user with id: ${userId} found`)
			return reviewsCount
		} catch (error) {
			handleError('Error getting reviews count', error, this.logger)
		}
	}
}
