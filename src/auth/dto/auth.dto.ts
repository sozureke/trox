import { RoleEnum } from '@user/user.enum'
import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	MaxLength,
	MinLength
} from 'class-validator'

export class AuthDto {
	@IsEmail()
	@IsNotEmpty({ message: 'Email is required' })
	email: string

	@IsString()
	@MinLength(8)
	@IsNotEmpty({ message: 'Password is required' })
	@Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
		message:
			'Password must be at least 8 characters long and include one letter and one number'
	})
	password: string
}

export class RegisterDto extends AuthDto {
	@IsString()
	@IsNotEmpty({ message: 'Name is required' })
	@MaxLength(50, { message: 'Name must be at most 50 characters long' })
	name: string

	@IsString()
	@IsNotEmpty({ message: 'Surname is required' })
	@MaxLength(50, { message: 'Surname must be at most 50 characters long' })
	surname: string

	@IsString()
	@IsNotEmpty({ message: 'Phone number is required' })
	@Matches(/^\+?[1-9]\d{1,14}$/, {
		message: 'Phone number must be in international format'
	})
	phoneNumber: string

	@IsEnum(RoleEnum, {
		message: `Role must be one of: ${Object.values(RoleEnum).join(', ')}`
	})
	@IsOptional()
	role?: RoleEnum = RoleEnum.USER
}
