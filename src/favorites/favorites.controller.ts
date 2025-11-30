import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Favorites')
@Controller('favs')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all favorites' })
  @ApiResponse({ status: 200, description: 'Return all favorites' })
  findAll() {
    return this.favoritesService.findAll();
  }

  @Post('artist/:id')
  @ApiOperation({ summary: 'Add artist to favorites' })
  @ApiParam({ name: 'id', description: 'Artist ID' })
  @ApiResponse({ status: 201, description: 'Artist added to favorites' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 422, description: 'Artist not found' })
  addArtist(@Param('id') id: string) {
    return this.favoritesService.addArtist(id);
  }

  @Delete('artist/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove artist from favorites' })
  @ApiParam({ name: 'id', description: 'Artist ID' })
  @ApiResponse({ status: 204, description: 'Artist removed from favorites' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Artist not found in favorites' })
  removeArtist(@Param('id') id: string) {
    return this.favoritesService.removeArtist(id);
  }

  @Post('album/:id')
  @ApiOperation({ summary: 'Add album to favorites' })
  @ApiParam({ name: 'id', description: 'Album ID' })
  @ApiResponse({ status: 201, description: 'Album added to favorites' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 422, description: 'Album not found' })
  addAlbum(@Param('id') id: string) {
    return this.favoritesService.addAlbum(id);
  }

  @Delete('album/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove album from favorites' })
  @ApiParam({ name: 'id', description: 'Album ID' })
  @ApiResponse({ status: 204, description: 'Album removed from favorites' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Album not found in favorites' })
  removeAlbum(@Param('id') id: string) {
    return this.favoritesService.removeAlbum(id);
  }

  @Post('track/:id')
  @ApiOperation({ summary: 'Add track to favorites' })
  @ApiParam({ name: 'id', description: 'Track ID' })
  @ApiResponse({ status: 201, description: 'Track added to favorites' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 422, description: 'Track not found' })
  addTrack(@Param('id') id: string) {
    return this.favoritesService.addTrack(id);
  }

  @Delete('track/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove track from favorites' })
  @ApiParam({ name: 'id', description: 'Track ID' })
  @ApiResponse({ status: 204, description: 'Track removed from favorites' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Track not found in favorites' })
  removeTrack(@Param('id') id: string) {
    return this.favoritesService.removeTrack(id);
  }
}
