import { Module, forwardRef } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { AlbumsController } from './albums.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ArtistsModule } from '../artists/artists.module';

@Module({
  imports: [PrismaModule, forwardRef(() => ArtistsModule)],
  controllers: [AlbumsController],
  providers: [AlbumsService],
  exports: [AlbumsService],
})
export class AlbumsModule {}
