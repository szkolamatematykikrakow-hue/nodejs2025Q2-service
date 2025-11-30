import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Track } from './interfaces/track.interface';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { validate as isUUID } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TracksService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Track[]> {
    return this.prisma.track.findMany();
  }

  async findOne(id: string): Promise<Track> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    const track = await this.prisma.track.findUnique({
      where: { id },
    });
    if (!track) {
      throw new NotFoundException('Track not found');
    }
    return track;
  }

  async create(createTrackDto: CreateTrackDto): Promise<Track> {
    return this.prisma.track.create({
      data: createTrackDto,
    });
  }

  async update(id: string, updateTrackDto: UpdateTrackDto): Promise<Track> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }

    const track = await this.prisma.track.findUnique({
      where: { id },
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    return this.prisma.track.update({
      where: { id },
      data: updateTrackDto,
    });
  }

  async remove(id: string): Promise<void> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }

    const track = await this.prisma.track.findUnique({
      where: { id },
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    // Find all favorites that contain this track
    const favorites = await this.prisma.favorites.findMany({
      where: {
        tracks: {
          some: { id },
        },
      },
    });

    // Remove track from favorites
    await Promise.all(
      favorites.map((favorite) =>
        this.prisma.favorites.update({
          where: { id: favorite.id },
          data: {
            tracks: {
              disconnect: { id },
            },
          },
        }),
      ),
    );

    // Delete track
    await this.prisma.track.delete({
      where: { id },
    });
  }

  async removeArtist(artistId: string): Promise<void> {
    await this.prisma.track.updateMany({
      where: { artistId },
      data: { artistId: null },
    });
  }
}
