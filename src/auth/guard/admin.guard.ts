import {
	CanActivate,
	ExecutionContext,
	ForbiddenException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RoleEnum } from 'src/user/user.enum'
import { UserModel } from 'src/user/user.model'

export class onlyAdminGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<{ user: UserModel }>()
		const user = request.user
		if (user.role !== RoleEnum.ADMIN)
			throw new ForbiddenException('You are not an admin')

		return user.role === RoleEnum.ADMIN
	}
}
