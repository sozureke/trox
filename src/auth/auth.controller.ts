import {
	Body,
	Controller,
	Get,
	HttpCode,
	Post,
	Query,
	Req,
	Res,
	UseGuards,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { AuthDto, RegisterDto } from './dto/auth.dto'
import { AuthResponse } from './interfaces/auth.interface'

@Controller('auth')
export class AuthController {
	constructor(private readonly AuthService: AuthService) {}

	@Post('login')
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	async login(@Body() dto: AuthDto): Promise<AuthResponse> {
		return this.AuthService.loginByEmail(dto)
	}

	@Get('/check-attempts')
	async checkAttempts(@Query('email') email: string) {
		return this.AuthService.getCacheData(`login_attempts:${email}`)
	}

	@Post('register')
	@UsePipes(new ValidationPipe())
	@HttpCode(201)
	async registerByEmail(@Body() dto: RegisterDto): Promise<AuthResponse> {
		return this.AuthService.registerByEmail(dto)
	}

	@Get('google')
	@UseGuards(AuthGuard('google'))
	googleAuth() {
		return { message: 'Redirecting to Google OAuth...' }
	}

	@Get('google/redirect')
	@UseGuards(AuthGuard('google'))
	googleAuthRedirect(@Req() req) {
		return {
			message: 'Authentication successful!',
			user: req.user
		}
	}

	@Get('github')
	@UseGuards(AuthGuard('github'))
	async githubAuth() {
		return { message: 'Redirecting to GitHub OAuth...' }
	}

	@Get('github/redirect')
	@UseGuards(AuthGuard('github'))
	async githubAuthRedirect(@Req() req, @Res() res) {
		const { user } = req
		return {
			message: 'Authentication successful!',
			user: res.json(user)
		}
	}
}
