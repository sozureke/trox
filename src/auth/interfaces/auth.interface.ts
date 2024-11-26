export interface AuthResponse {
	user: any
	refreshToken: string
	accessToken: string
}

export interface IOAuthProfile {
	email: string
	name?: {
		givenName?: string
		familyName?: string
	}
	username?: string
	photos?: { value: string }[]
	picture?: string
}

export enum OAuthProvider {
	GOOGLE = 'google',
	GITHUB = 'github'
}
