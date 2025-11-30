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

    // Najpierw ustawiamy track.artistId na null dla wszystkich utworów tego artysty
    await this.prisma.track.updateMany({
      where: { artistId: id },
      data: { artistId: null },
    });

    // Update all albums to remove artist reference
    await Promise.all(
      artist.albums.map((album) =>
        this.prisma.album.update({
          where: { id: album.id },
          data: { artistId: null },
        }),
      ),
    );

    // Remove artist from favorites
    await Promise.all(
      artist.favorites.map((favorite) =>
        this.prisma.favorites.update({
          where: { id: favorite.id },
          data: {
            artists: {
              disconnect: { id },
            },
          },
        }),
      ),
    );

    // Delete the artist
    await this.prisma.artist.delete({
      where: { id },
    });
  }
}
