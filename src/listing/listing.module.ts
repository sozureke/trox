import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypegooseModule } from 'nestjs-typegoose'
import { ListingController } from './listing.controller'
import { ListingModel } from './listing.model'
import { ListingService } from './listing.service'

@Module({
	imports: [
		TypegooseModule.forFeature([
			{ typegooseClass: ListingModel, schemaOptions: { collection: 'Listing' } }
		]),
		ConfigModule
	],
	controllers: [ListingController],
	providers: [ListingService]
})
export class ListingModule {}
