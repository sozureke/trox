import { UseGuards, applyDecorators } from '@nestjs/common'
import { RoleEnum } from 'src/user/user.enum'
import { onlyAdminGuard } from '../guard/admin.guard'
import { JwtAuthGuard } from '../guard/jwt.guard'

export const Auth = (role: RoleEnum = RoleEnum.GUEST) =>
	applyDecorators(
		role === RoleEnum.ADMIN
			? UseGuards(JwtAuthGuard, onlyAdminGuard)
			: UseGuards(JwtAuthGuard)
	)
