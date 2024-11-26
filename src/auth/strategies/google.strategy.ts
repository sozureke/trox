import { AuthService } from '@auth/auth.service'
import { Inject } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'

export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor(@Inject(AuthService) private readonly AuthService: AuthService) {
		super({
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
			scope: ['email', 'profile']
		})
	}

	async validate(
		accessToken: string,
		refreshToken: string,
		profile: any,
		done: VerifyCallback
	): Promise<any> {
		try {
			const user = await this.AuthService.validateGoogleUser(profile)
			done(null, user)
		} catch (error) {
			done(error, false)
		}
	}
}
