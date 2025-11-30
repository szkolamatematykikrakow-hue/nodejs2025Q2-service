import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Albums')
@Controller('album')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new album' })
  @ApiResponse({ status: 201, description: 'Album successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createAlbumDto: CreateAlbumDto) {
    return this.albumsService.create(createAlbumDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all albums' })
  @ApiResponse({ status: 200, description: 'Return all albums' })
  findAll() {
    return this.albumsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get album by id' })
  @ApiParam({ name: 'id', description: 'Album ID' })
  @ApiResponse({ status: 200, description: 'Return album by id' })
  @ApiResponse({ status: 404, description: 'Album not found' })
  findOne(@Param('id') id: string) {
    return this.albumsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update album by id' })
  @ApiParam({ name: 'id', description: 'Album ID' })
  @ApiResponse({ status: 200, description: 'Album successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Album not found' })
  update(@Param('id') id: string, @Body() updateAlbumDto: UpdateAlbumDto) {
    return this.albumsService.update(id, updateAlbumDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete album by id' })
  @ApiParam({ name: 'id', description: 'Album ID' })
  @ApiResponse({ status: 204, description: 'Album successfully deleted' })
  @ApiResponse({ status: 404, description: 'Album not found' })
  remove(@Param('id') id: string) {
    return this.albumsService.remove(id);
  }
}
