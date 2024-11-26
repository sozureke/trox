import { BanService } from '@ban/ban.service'
import { ConflictException, ForbiddenException, Logger } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { UserModel } from '@user/user.model'
import { handleError, handleNoRecords } from './handle_error'

export const ensureUserExistsById = async (
	userId: string,
	userModel: ModelType<UserModel>,
	logger: Logger
): Promise<void> => {
	try {
		const user = await userModel.findById(userId)
		if (!user) {
			handleNoRecords(`User with id ${userId} not found`, logger)
		}
	} catch (error) {
		handleError('Error getting user', error, logger)
	}
}

export async function ensureUserExistsByEmailAndCheckBan(
	email: string,
	userModel: ModelType<UserModel>,
	banService: BanService,
	logger: Logger
): Promise<UserModel> {
	try {
		const user = await userModel.findOne({ email })
		if (!user) {
			handleNoRecords(`User with email ${email} not found`, logger)
		}

		const isBanned = await banService.isUserBanned(String(user._id))
		if (isBanned) {
			logger.warn(`User with email ${email} is banned.`)
			throw new ForbiddenException(
				`User with email ${email} is currently banned.`
			)
		}

		logger.log(`User with email ${email} exists and is not banned.`)
		return user
	} catch (error) {
		handleError(
			`Error checking user existence and ban status for email: ${email}`,
			error,
			logger
		)
	}
}

export const ensureUserDoesNotExistByEmail = async (
	email: string,
	userModel: ModelType<UserModel>,
	logger: Logger
): Promise<void> => {
	try {
		const user = await userModel.findOne({ email })
		if (user) {
			logger.warn(`User with email ${email} already exists`)
			throw new ConflictException('User with this email already exists')
		}
	} catch (error) {
		handleError('Error checking if user exists', error, logger)
	}
}
