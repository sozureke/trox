import { AuthService } from '@auth/auth.service'
import { IGitHubUser } from '@auth/interfaces/github.interface'
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy } from 'passport-github2'

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
	constructor(private readonly AuthService: AuthService) {
		super({
			clientID: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			callbackURL: process.env.GITHUB_CALLBACK_URL,
			scope: ['user:email']
		})
	}

	async validate(
		accessToken: string,
		refreshToken: string,
		profile: Profile,
		done: Function
	) {
		try {
			const { username, emails, photos } = profile
			const user: IGitHubUser = {
				email: emails?.[0]?.value,
				username: username,
				picture: photos?.[0]?.value,
				provider: 'github',
				accessToken
			}

			return this.AuthService.validateGitHubUser(user)
		} catch (error) {
			done(error, false)
		}
	}
}
