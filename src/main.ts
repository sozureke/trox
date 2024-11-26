import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { swaggerConfig } from './config/swagger.config'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.setGlobalPrefix('api')
	swaggerConfig(app)
	await app.listen(4200)
}
bootstrap()
