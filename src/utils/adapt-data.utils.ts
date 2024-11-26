import { IOAuthProfile } from '@auth/interfaces/auth.interface'
import { IGitHubUser } from '@auth/interfaces/github.interface'
import { IGoogleProfile } from '@auth/interfaces/google.interface'

export function adaptGoogleProfile(profile: IGoogleProfile): IOAuthProfile {
	return {
		email: profile.emails[0].value,
		name: {
			givenName: profile.name.givenName,
			familyName: profile.name.familyName
		},
		photos: profile.photos
	}
}

export function adaptGitHubProfile(profile: IGitHubUser): IOAuthProfile {
	return {
		email: profile.email,
		username: profile.username,
		picture: profile.picture
	}
}

export function adaptFacebookProfile(profile: any): IOAuthProfile {
	return {
		email: profile.emails?.[0]?.value || null,
		name: {
			givenName: profile.name?.givenName || profile.displayName || 'Unknown',
			familyName: profile.name?.familyName || ''
		},
		photos: profile.photos,
		picture: profile.photos?.[0]?.value || ''
	}
}
