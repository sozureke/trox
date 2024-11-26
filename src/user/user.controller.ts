import { Auth } from '@auth/decorators/auth.decorator'
import { Controller, Delete, Get, HttpCode, Param, Query } from '@nestjs/common'
import { IdValidationPipe } from '@pipes/id.validation.pipe'
import { User } from './decorator/user.decorator'
import { RoleEnum } from './user.enum'
import { UserModel } from './user.model'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
	constructor(private readonly UserService: UserService) {}

	@Get('id')
	@HttpCode(200)
	@Auth(RoleEnum.ADMIN)
	async getUserById(
		@Param('id', IdValidationPipe) id: string
	): Promise<UserModel> {
		return await this.UserService.getUserById(id)
	}

	@Get('/profile')
	@HttpCode(200)
	@Auth(RoleEnum.ADMIN)
	async getProfile(@User('id') id: string): Promise<UserModel> {
		return await this.UserService.getUserById(id)
	}

	@Delete(':id')
	@HttpCode(204)
	@Auth(RoleEnum.ADMIN)
	async deleteUser(@Param('id', IdValidationPipe) id: string): Promise<void> {
		await this.UserService.deleteUser(id)
	}

	@Get('/all')
	@HttpCode(200)
	@Auth(RoleEnum.ADMIN)
	async getAllUsers(
		@Query('searchTerm') searchTerm?: string
	): Promise<UserModel[]> {
		return await this.UserService.getAllUsers(searchTerm)
	}

	@Get('/role')
	@HttpCode(200)
	@Auth(RoleEnum.ADMIN)
	async getUsersByRole(
		@Query('role') role: RoleEnum,
		@Query('limit') limit?: number
	): Promise<UserModel[]> {
		return await this.UserService.getUserByRole(role, limit)
	}

	@Get('/banned')
	@HttpCode(200)
	@Auth(RoleEnum.ADMIN)
	async getBannedUsers(@Query('limit') limit: number): Promise<UserModel[]> {
		return await this.UserService.getBannedUsers(limit)
	}

	@Get('/:email')
	@HttpCode(200)
	@Auth(RoleEnum.ADMIN)
	async getUserByEmail(@Param('email') email: string): Promise<UserModel> {
		return await this.UserService.getUserByEmail(email)
	}
}
