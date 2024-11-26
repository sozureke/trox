import { Injectable, Logger } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { handleError, handleNoRecords } from '@utils/handle_error'
import { ensureUserExistsById } from '@utils/user.utils'
import { InjectModel } from 'nestjs-typegoose'
import { RoleEnum } from './user.enum'
import { UserModel } from './user.model'

@Injectable()
export class UserService {
	private readonly logger = new Logger(UserService.name)
	constructor(
		@InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>
	) {}

	async getUserById(id: string): Promise<UserModel> {
		try {
			const user = await this.UserModel.findById(id)
			if (!user) handleNoRecords(`User with id ${id} not found`, this.logger)

			this.logger.log(`User with id ${id} found`)
			return user
		} catch (error) {
			handleError('Error getting user', error, this.logger)
		}
	}

	async deleteUser(id: string): Promise<void> {
		ensureUserExistsById(id, this.UserModel, this.logger)
		try {
			this.logger.log(`User with id ${id} deleted`)
			await this.UserModel.findByIdAndDelete(id).exec()
		} catch (error) {
			handleError('Error deleting user', error, this.logger)
		}
	}

	async getAllUsers(searchTerm?: string) {
		let options = {}

		if (searchTerm) {
			options = {
				$or: [
					{
						email: new RegExp(searchTerm, 'i')
					}
				]
			}
		}

		return this.UserModel.find(options)
			.select('-password -updatedAt -__v')
			.sort({ createdAt: 'desc' })
			.exec()
	}

	async getUserByRole(role: RoleEnum, limit?: number): Promise<UserModel[]> {
		try {
			const users = await this.UserModel.find({ 'userInfo.role': role })
				.limit(limit)
				.exec()
			if (!users || users.length === 0)
				handleNoRecords(`No users found with role ${role}`, this.logger)

			this.logger.log(`Users found with role ${role}`)
			return users
		} catch (error) {
			handleError('Error getting user by role', error, this.logger)
		}
	}

	async getBannedUsers(limit?: number): Promise<UserModel[]> {
		try {
			const bannedUsers = await this.UserModel.find({
				'userInfo.isBanned': true
			})
				.limit(limit)
				.exec()
			if (!bannedUsers || bannedUsers.length === 0)
				handleNoRecords('No banned users found', this.logger)

			this.logger.log('Banned users found')
			return bannedUsers
		} catch (error) {
			handleError('Error getting banned users', error, this.logger)
		}
	}

	async getUserByEmail(email: string): Promise<UserModel> {
		try {
			const user = await this.UserModel.findOne({ email }).exec()
			if (!user)
				handleNoRecords(`User with email ${email} not found`, this.logger)

			this.logger.log(`User with email ${email} found`)
			return user
		} catch (error) {
			handleError('Error getting user by email', error, this.logger)
		}
	}
}
