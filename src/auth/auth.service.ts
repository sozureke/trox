import { BanService } from '@ban/ban.service'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	Logger,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { RoleEnum } from '@user/user.enum'
import { UserModel } from '@user/user.model'
import { UserService } from '@user/user.service'
import { adaptGitHubProfile, adaptGoogleProfile } from '@utils/adapt-data.utils'
import { handleError, handleNoRecords } from '@utils/handle_error'
import { ensureUserDoesNotExistByEmail } from '@utils/user.utils'
import { compare, genSalt, hash } from 'bcryptjs'
import { Cache } from 'cache-manager'
import { InjectModel } from 'nestjs-typegoose'
import { AuthDto, RegisterDto } from './dto/auth.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import {
	AuthResponse,
	IOAuthProfile,
	OAuthProvider
} from './interfaces/auth.interface'
import { IGitHubUser } from './interfaces/github.interface'
import { IGoogleProfile } from './interfaces/google.interface'

@Injectable()
export class AuthService {
	private logger = new Logger(AuthService.name)

	constructor(
		@InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>,
		@Inject(CACHE_MANAGER) private CacheManager: Cache,
		private readonly UserService: UserService,
		private readonly JwtService: JwtService,
		private readonly BanService: BanService
	) {}

	async loginByEmail(dto: AuthDto): Promise<AuthResponse> {
		const LOGIN_ATTEMPTS_KEY = `login_attempts:${dto.email}`
		const MAX_LOGIN_ATTEMPTS = 3
		const BLOCK_TIME = 600

		try {
			const attempts = await this.CacheManager.get<number>(LOGIN_ATTEMPTS_KEY)
			if (attempts && attempts >= MAX_LOGIN_ATTEMPTS) {
				await this.BanService.autoBanUser(
					dto.email,
					'Too many login attempts',
					BLOCK_TIME
				)
				throw new ForbiddenException(
					`You have been banned due to too many failed login attempts. Please try again after ${BLOCK_TIME / 60} minutes.`
				)
			}

			const validatedUser = await this.validateUser(dto)

			await this.CacheManager.del(LOGIN_ATTEMPTS_KEY) // Сброс попыток
			const tokens = await this.issueTokenPair(String(validatedUser._id))
			this.logger.log(`User with ${validatedUser.email} logged in successfully`)
			return { user: this.returnUserFields(validatedUser), ...tokens }
		} catch (error) {
			if (error instanceof UnauthorizedException) {
				await this.incrementLoginAttempts(
					LOGIN_ATTEMPTS_KEY,
					MAX_LOGIN_ATTEMPTS,
					BLOCK_TIME
				)
			}
			throw error
		}
	}

	async getCacheData(key: string): Promise<any> {
		try {
			const data = await this.CacheManager.get(key)
			this.logger.log(`Cache data for key ${key}: ${JSON.stringify(data)}`)
			return data
		} catch (error) {
			this.logger.error(
				`Error retrieving cache data for key ${key}`,
				error.stack
			)
		}
	}

	async registerByEmail(dto: RegisterDto): Promise<AuthResponse> {
		await ensureUserDoesNotExistByEmail(dto.email, this.UserModel, this.logger)
		try {
			const salt = await genSalt(12)
			const hashedPassword = await hash(dto.password, salt)

			const userData: Partial<UserModel> = {
				email: dto.email,
				password: hashedPassword,
				name: dto.name,
				surname: dto.surname,
				phoneNumber: dto.phoneNumber,
				role: dto.role || RoleEnum.USER
			}

			const user = await this.findOrCreateUser(dto.email, userData)
			this.logger.log('User registered successfully')
			return this.generateTokensForUser(String(user._id))
		} catch (error) {
			handleError('Error during registration', error, this.logger)
		}
	}

	async validateUser(dto: AuthDto): Promise<UserModel> {
		const user = await this.UserService.getUserByEmail(dto.email)
		if (!user) {
			throw new UnauthorizedException(
				`User with ${dto.email} email does not exist`
			)
		}

		const isPasswordValid = await compare(dto.password, user.password)
		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid password')
		}

		return user
	}

	async handleOAuthUser(
		profile: IOAuthProfile,
		provider: OAuthProvider
	): Promise<AuthResponse> {
		try {
			const userData: Partial<UserModel> = {
				email: profile.email,
				name: profile.name?.givenName || profile.username || 'Unknown',
				surname: profile.name?.familyName || 'User',
				avatar: profile.photos ? profile.photos[0]?.value : profile.picture,
				role: RoleEnum.USER
			}

			const user = await this.findOrCreateUser(profile.email, userData)
			this.logger.log(`User processed for ${provider}`)
			return this.generateTokensForUser(String(user._id))
		} catch (error) {
			handleError(`Error handling ${provider} user`, error, this.logger)
		}
	}

	async validateGoogleUser(profile: IGoogleProfile): Promise<AuthResponse> {
		const adaptedProfile = adaptGoogleProfile(profile)
		return this.handleOAuthUser(adaptedProfile, OAuthProvider.GOOGLE)
	}

	async validateGitHubUser(profile: IGitHubUser): Promise<AuthResponse> {
		const adaptedProfile = adaptGitHubProfile(profile)
		return this.handleOAuthUser(adaptedProfile, OAuthProvider.GITHUB)
	}

	async getNewTokens({ refreshToken }: RefreshTokenDto): Promise<AuthResponse> {
		if (!refreshToken) {
			throw new UnauthorizedException('Invalid token or you did not sign in')
		}

		try {
			const token = await this.JwtService.verifyAsync(refreshToken)
			const user = await this.UserModel.findById(token._id)
			if (!user) handleNoRecords('User not found for this token', this.logger)

			this.logger.log('Tokens refreshed successfully')
			return this.generateTokensForUser(String(user._id))
		} catch (error) {
			if (error.name === 'TokenExpiredError') {
				throw new UnauthorizedException('Token has expired')
			}
			handleError('Error during token refresh', error, this.logger)
		}
	}

	async issueTokenPair(
		userId: string
	): Promise<{ accessToken: string; refreshToken: string }> {
		try {
			const data = { _id: userId }
			const refreshToken = await this.JwtService.signAsync(data, {
				expiresIn: '15d'
			})

			const accessToken = await this.JwtService.signAsync(data, {
				expiresIn: '1h'
			})

			return { refreshToken, accessToken }
		} catch (error) {
			handleError('Error issuing token pair', error, this.logger)
		}
	}

	private returnUserFields(user: UserModel) {
		return {
			_id: user._id,
			email: user.email,
			role: user.role,
			isBanned: user.isBanned
		}
	}

	private async findOrCreateUser(
		email: string,
		userData: Partial<UserModel>
	): Promise<UserModel> {
		try {
			let user = await this.UserModel.findOne({ email })
			if (user) {
				throw new BadRequestException(
					`User with email ${email} already exists.`
				)
			}
			user = new this.UserModel(userData)
			await user.save()
			this.logger.log(`New user created with email: ${email}`)
			return user
		} catch (error) {
			handleError('Error during user creation', error, this.logger)
		}
	}

	private async generateTokensForUser(userId: string): Promise<AuthResponse> {
		try {
			const tokens = await this.issueTokenPair(userId)
			const user = await this.UserModel.findById(userId)
			if (!user) handleNoRecords('User not found for token', this.logger)
			return { user: this.returnUserFields(user), ...tokens }
		} catch (error) {
			handleError('Error during token generation', error, this.logger)
		}
	}

	private async incrementLoginAttempts(
		attemptsKey: string,
		maxAttempts: number,
		blockTime: number
	): Promise<number> {
		try {
			const attempts =
				((await this.CacheManager.get<number>(attemptsKey)) || 0) + 1
			await this.CacheManager.set(attemptsKey, attempts, blockTime)

			this.logger.log(
				`Login attempts for ${attemptsKey} incremented to ${attempts}`
			)

			if (attempts >= maxAttempts) {
				throw new ForbiddenException(
					`Too many login attempts. Please try again after ${blockTime / 60} minutes.`
				)
			}
			return attempts
		} catch (error) {
			handleError('Error during login attempts increment', error, this.logger)
		}
	}
}
