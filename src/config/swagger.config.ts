import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export const swaggerConfig = (app: INestApplication) => {
	const config = new DocumentBuilder()
		.setTitle('TROX API')
		.setDescription('API for TROX')
		.setVersion('1.0')
		.build()

	const documentFactory = () => SwaggerModule.createDocument(app, config)
	return SwaggerModule.setup('api', app, documentFactory)
}
