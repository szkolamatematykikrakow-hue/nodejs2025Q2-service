import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { validate as isUUID } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlbumsService {
  constructor(private prisma: PrismaService) {}

  async create(createAlbumDto: CreateAlbumDto) {
    return this.prisma.album.create({
      data: createAlbumDto,
    });
  }

  async findAll() {
    return this.prisma.album.findMany();
  }

  async findOne(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }

    const album = await this.prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }

    return album;
  }

  async update(id: string, updateAlbumDto: UpdateAlbumDto) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }

    const album = await this.prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new NotFoundException('Album not found');
    }

    if (
      updateAlbumDto.name !== undefined &&
      typeof updateAlbumDto.name !== 'string'
    ) {
      throw new BadRequestException('Name must be a string');
    }
    if (
      updateAlbumDto.year !== undefined &&
      (typeof updateAlbumDto.year !== 'number' ||
        updateAlbumDto.year < 1900 ||
        updateAlbumDto.year > new Date().getFullYear())
    ) {
      throw new BadRequestException(
        'Year must be a number between 1900 and current year',
      );
    }
    if (
      updateAlbumDto.artistId !== undefined &&
      updateAlbumDto.artistId !== null &&
      !isUUID(updateAlbumDto.artistId)
    ) {
      throw new BadRequestException('Invalid artistId UUID');
    }

    return this.prisma.album.update({
      where: { id },
      data: updateAlbumDto,
    });
  }

  async remove(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }

    const album = await this.prisma.album.findUnique({
      where: { id },
      include: {
        favorites: true,
      },
    });

    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }

    // Najpierw ustawiamy track.albumId na null dla wszystkich utworów z tego albumu
    await this.prisma.track.updateMany({
      where: { albumId: id },
      data: { albumId: null },
    });

    // Remove album from favorites
    await Promise.all(
      album.favorites.map((favorite) =>
        this.prisma.favorites.update({
          where: { id: favorite.id },
          data: {
            albums: {
              disconnect: { id },
            },
          },
        }),
      ),
    );

    // Następnie usuwamy album
    await this.prisma.album.delete({
      where: { id },
    });
  }

  async removeArtist(artistId: string) {
    await this.prisma.album.updateMany({
      where: { artistId },
      data: { artistId: null },
    });
  }
}
