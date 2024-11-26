import { BadRequestException, Logger, NotFoundException } from '@nestjs/common'

export function handleNoRecords(message: string, logger: Logger): never {
	logger.warn(message)
	throw new NotFoundException(message)
}

export function handleError(
	message: string,
	error: Error,
	logger: Logger
): never {
	logger.error(message, error.stack)
	throw new BadRequestException(message)
}
