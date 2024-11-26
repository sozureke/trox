import { Injectable, Logger } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { UserModel } from '@user/user.model'
import { handleError, handleNoRecords } from '@utils/handle_error'
import { ensureUserExistsById } from '@utils/user.utils'
import { InjectModel } from 'nestjs-typegoose'
import { BanModel } from './ban.model'
import { SetBanDto } from './dto/set.dto'

@Injectable()
export class BanService {
	private readonly logger = new Logger(BanService.name)
	constructor(
		@InjectModel(BanModel) private readonly BanModel: ModelType<BanModel>,
		@InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>
	) {}

	async autoBanUser(
		email: string,
		reason: string,
		duration: number
	): Promise<void> {
		try {
			// Найти пользователя по email
			const user = await this.UserModel.findOne({ email })
			if (!user) {
				throw new Error(`User with email ${email} not found`)
			}

			// Проверить, есть ли активный бан для пользователя
			const existingBan = await this.BanModel.findOne({
				userId: user._id,
				banEnd: { $gte: new Date() } // Бан, который еще активен
			})

			if (existingBan) {
				this.logger.warn(
					`User ${email} is already banned until ${existingBan.banEnd}`
				)
				return
			}

			const banEnd = new Date(Date.now() + duration * 1000)
			const ban = new this.BanModel({
				userId: user._id,
				reason,
				banStart: new Date(),
				banEnd,
				duration: duration / 60
			})

			await ban.save()
			this.logger.log(`User ${email} banned successfully until ${banEnd}`)
		} catch (error) {
			this.logger.error(`Failed to ban user ${email}`, error.stack)
			throw new Error('Error banning user')
		}
	}

	async setBan(dto: SetBanDto): Promise<BanModel | null> {
		await ensureUserExistsById(dto.user_id, this.UserModel, this.logger)
		try {
			const isBanned = await this.isUserBanned(dto.user_id)
			if (isBanned) {
				this.logger.warn(
					`User ${dto.user_id} is already banned for an active reason.`
				)
				return null
			}

			const ban = await this.BanModel.create(dto)

			await this.UserModel.findByIdAndUpdate(dto.user_id, {
				$set: { 'userInfo.isBanned': true },
				$addToSet: { 'userInfo.banList': ban._id }
			})

			this.logger.log(
				`User ${dto.user_id} has been banned for ${dto.duration} days. Reason: ${dto.reason}`
			)

			return ban
		} catch (error) {
			handleError('Error setting ban', error, this.logger)
		}
	}

	async removeBan(userId: string): Promise<void> {
		await ensureUserExistsById(userId, this.UserModel, this.logger)
		try {
			const activeBan = await this.BanModel.findOneAndUpdate(
				{ user_id: userId, isActive: true },
				{ isActive: false }
			)
			if (!activeBan)
				handleNoRecords('No active ban found for user', this.logger)

			await this.UserModel.findByIdAndUpdate(userId, {
				$set: { 'userInfo.isBanned': false }
			}).exec()
			this.logger.log(`Ban removed for user ${userId}`)
		} catch (error) {
			handleError('Error removing ban', error, this.logger)
		}
	}

	async extendBan(userId: string, additionalDays: number): Promise<BanModel> {
		await ensureUserExistsById(userId, this.UserModel, this.logger)
		try {
			const activeBan = await this.BanModel.findOne({
				user_id: userId,
				isActive: true
			})
			if (!activeBan)
				handleNoRecords('No active ban found for user', this.logger)

			activeBan.banEnd = new Date(
				activeBan.banEnd.getTime() + additionalDays * 24 * 60 * 60 * 1000
			)
			await activeBan.save()

			this.logger.log(
				`Ban for user ${userId} extended by ${additionalDays} days`
			)
			return activeBan
		} catch (error) {
			handleError('Error extending ban', error, this.logger)
		}
	}

	async deactivateExpiredBans(): Promise<number> {
		try {
			const { modifiedCount } = await this.BanModel.updateMany(
				{ isActive: true, ban_end: { $lt: new Date() } },
				{ $set: { isActive: false } }
			)
			this.logger.log(`Deactivated ${modifiedCount} expired bans`)
			return modifiedCount
		} catch (error) {
			handleError('Error deactivating expired bans', error, this.logger)
		}
	}

	async isUserBanned(userId: string): Promise<boolean> {
		await ensureUserExistsById(userId, this.UserModel, this.logger)
		try {
			const activeBan = await this.BanModel.findOne({
				userId,
				ban_end: { $gte: new Date() }
			})
			return !!activeBan
		} catch (error) {
			handleError('Error checking if user is banned', error, this.logger)
		}
	}

	async getBannedUsers(): Promise<UserModel[]> {
		try {
			const bannedUsers = await this.UserModel.find({
				'userInfo.isBanned': true
			})
			if (!bannedUsers || bannedUsers.length === 0)
				handleNoRecords('No banned users found', this.logger)

			this.logger.log(`Found ${bannedUsers.length} banned users`)
			return bannedUsers
		} catch (error) {
			handleError('Error getting banned users', error, this.logger)
		}
	}

	async getUserBans(userId: string): Promise<BanModel[]> {
		try {
			const bans = await this.BanModel.find({ userId }).sort({ ban_start: -1 })
			if (!bans || bans.length === 0)
				handleNoRecords(`No bans found for user with id ${userId}`, this.logger)

			this.logger.log(`Found ${bans.length} bans for user ${userId}`)
			return bans
		} catch (error) {
			handleError(
				`Error getting user bans with id ${userId}`,
				error,
				this.logger
			)
		}
	}

	async getUserStatus(userId: string): Promise<void> {
		ensureUserExistsById(userId, this.UserModel, this.logger)
		try {
			const { isActive, reason, duration, banEnd } =
				await this.BanModel.findOne({ user_id: userId, isActive: true })
			if (!isActive) {
				handleNoRecords(
					`No active ban found for user with id ${userId}`,
					this.logger
				)
			}

			this.logger.log(
				`User ${userId} is banned until ${banEnd} for reason: ${reason} until ${duration} days`
			)
		} catch (error) {
			handleError('Error getting user ban status', error, this.logger)
		}
	}
}
