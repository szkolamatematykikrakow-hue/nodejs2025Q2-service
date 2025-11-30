import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { validate as isUUID } from 'uuid';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const favorites = await this.prisma.favorites.findFirst({
      include: {
        artists: true,
        albums: true,
        tracks: true,
      },
    });

    return favorites || { artists: [], albums: [], tracks: [] };
  }

  async addArtist(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid artist ID');
    }

    const artist = await this.prisma.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new UnprocessableEntityException('Artist not found');
    }

    const favorites = await this.prisma.favorites.findFirst();
    if (!favorites) {
      return this.prisma.favorites.create({
        data: {
          artists: {
            connect: { id },
          },
        },
        include: {
          artists: true,
          albums: true,
          tracks: true,
        },
      });
    }

    return this.prisma.favorites.update({
      where: { id: favorites.id },
      data: {
        artists: {
          connect: { id },
        },
      },
      include: {
        artists: true,
        albums: true,
        tracks: true,
      },
    });
  }

  async removeArtist(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid artist ID');
    }

    const favorites = await this.prisma.favorites.findFirst({
      where: {
        artists: {
          some: { id },
        },
      },
    });

    if (!favorites) {
      throw new NotFoundException('Artist not found in favorites');
    }

    return this.prisma.favorites.update({
      where: { id: favorites.id },
      data: {
        artists: {
          disconnect: { id },
        },
      },
    });
  }

  async addAlbum(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid album ID');
    }

    const album = await this.prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new UnprocessableEntityException('Album not found');
    }

    const favorites = await this.prisma.favorites.findFirst();
    if (!favorites) {
      return this.prisma.favorites.create({
        data: {
          albums: {
            connect: { id },
          },
        },
        include: {
          artists: true,
          albums: true,
          tracks: true,
        },
      });
    }

    return this.prisma.favorites.update({
      where: { id: favorites.id },
      data: {
        albums: {
          connect: { id },
        },
      },
      include: {
        artists: true,
        albums: true,
        tracks: true,
      },
    });
  }

  async removeAlbum(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid album ID');
    }

    const favorites = await this.prisma.favorites.findFirst({
      where: {
        albums: {
          some: { id },
        },
      },
    });

    if (!favorites) {
      throw new NotFoundException('Album not found in favorites');
    }

    return this.prisma.favorites.update({
      where: { id: favorites.id },
      data: {
        albums: {
          disconnect: { id },
        },
      },
    });
  }

  async addTrack(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid track ID');
    }

    const track = await this.prisma.track.findUnique({
      where: { id },
    });

    if (!track) {
      throw new UnprocessableEntityException('Track not found');
    }

    const favorites = await this.prisma.favorites.findFirst();
    if (!favorites) {
      return this.prisma.favorites.create({
        data: {
          tracks: {
            connect: { id },
          },
        },
        include: {
          artists: true,
          albums: true,
          tracks: true,
        },
      });
    }

    return this.prisma.favorites.update({
      where: { id: favorites.id },
      data: {
        tracks: {
          connect: { id },
        },
      },
      include: {
        artists: true,
        albums: true,
        tracks: true,
      },
    });
  }

  async removeTrack(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid track ID');
    }

    const favorites = await this.prisma.favorites.findFirst({
      where: {
        tracks: {
          some: { id },
        },
      },
    });

    if (!favorites) {
      throw new NotFoundException('Track not found in favorites');
    }

    return this.prisma.favorites.update({
      where: { id: favorites.id },
      data: {
        tracks: {
          disconnect: { id },
        },
      },
    });
  }
}
