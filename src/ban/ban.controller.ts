import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { IdValidationPipe } from '@pipes/id.validation.pipe'
import { UserModel } from '@user/user.model'
import { BanModel } from './ban.model'
import { BanService } from './ban.service'
import { SetBanDto } from './dto/set.dto'

@Controller('ban')
export class BanController {
	constructor(private readonly BanService: BanService) {}

	@Post()
	@HttpCode(201)
	@UsePipes(new ValidationPipe())
	async setBan(@Body() dto: SetBanDto): Promise<BanModel> {
		return await this.BanService.setBan(dto)
	}

	@Delete(':userId')
	@HttpCode(204)
	async removeBan(
		@Param('userId', IdValidationPipe) userId: string
	): Promise<void> {
		return await this.BanService.removeBan(userId)
	}

	@Put(':userId/extend')
	@HttpCode(200)
	async extendBan(
		@Param('userId', IdValidationPipe) userId: string,
		@Body('additionalDays') additionalDays: number
	): Promise<BanModel> {
		return await this.BanService.extendBan(userId, additionalDays)
	}

	@Put('deactivate-expired')
	@HttpCode(200)
	async deactivateExpiredBans(): Promise<void> {
		await this.BanService.deactivateExpiredBans()
	}

	@Get(':userId/status')
	@HttpCode(200)
	async getBanStatus(
		@Param('userId', IdValidationPipe) userId: string
	): Promise<void> {
		return await this.BanService.getUserStatus(userId)
	}

	@Get('banned-users')
	@HttpCode(200)
	async getBannedUsers(): Promise<UserModel[]> {
		return await this.BanService.getBannedUsers()
	}

	@Get(':userId')
	@HttpCode(200)
	async getBans(
		@Param('userId', IdValidationPipe) userId: string
	): Promise<BanModel[]> {
		return await this.BanService.getUserBans(userId)
	}
}
