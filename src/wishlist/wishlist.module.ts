import { ListingModule } from '@listing/listing.module'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypegooseModule } from 'nestjs-typegoose'
import { WishlistController } from './wishlist.controller'
import { WishlistModel } from './wishlist.model'
import { WishlistService } from './wishlist.service'

@Module({
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: WishlistModel,
				schemaOptions: {
					collection: 'Wishlist'
				}
			}
		]),
		ListingModule,
		ConfigModule
	],
	controllers: [WishlistController],
	providers: [WishlistService]
})
export class WishlistModule {}
