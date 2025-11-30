import { Injectable, NotFoundException } from '@nestjs/common';
import { Artist } from './interfaces/artist.interface';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { AlbumsService } from '../albums/albums.service';
import { TracksService } from '../tracks/tracks.service';
import { PrismaService } from '../prisma/prisma.service';
import { ApiProperty } from '@nestjs/swagger';

export class ArtistResponse implements Artist {
  @ApiProperty({ description: 'Artist ID' })
  id: string;

  @ApiProperty({ description: 'Artist name' })
  name: string;

  @ApiProperty({ description: 'Whether artist has won Grammy' })
  grammy: boolean;
}

@Injectable()
export class ArtistsService {
  constructor(
    private readonly albumsService: AlbumsService,
    private readonly tracksService: TracksService,
    private prisma: PrismaService,
  ) {}

  async findAll(): Promise<ArtistResponse[]> {
    return this.prisma.artist.findMany();
  }

  async findOne(id: string): Promise<ArtistResponse> {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }

    return artist;
  }

  async create(createArtistDto: CreateArtistDto): Promise<ArtistResponse> {
    return this.prisma.artist.create({
      data: createArtistDto,
    });
  }

  async update(
    id: string,
    updateArtistDto: UpdateArtistDto,
  ): Promise<ArtistResponse> {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }

    return this.prisma.artist.update({
      where: { id },
      data: updateArtistDto,
    });
  }

  async remove(id: string): Promise<void> {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
      include: {
        albums: true,
        favorites: true,
      },
    });

    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }

    // Use transaction to ensure all updates happen atomically
    await this.prisma.$transaction([
      // Update all tracks to remove artist reference
      this.prisma.track.updateMany({
        where: { artistId: id },
        data: { artistId: null },
      }),
      // Update all albums to remove artist reference
      this.prisma.album.updateMany({
        where: { artistId: id },
        data: { artistId: null },
      }),
      // Remove artist from favorites
      ...artist.favorites.map((favorite) =>
        this.prisma.favorites.update({
          where: { id: favorite.id },
          data: {
            artists: {
              disconnect: { id },
            },
          },
        }),
      ),
      // Delete the artist
      this.prisma.artist.delete({
        where: { id },
      }),
    ]);
  }
}
