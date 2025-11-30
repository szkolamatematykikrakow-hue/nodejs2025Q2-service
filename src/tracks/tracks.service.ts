import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Track } from './interfaces/track.interface';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class TracksService {
  private tracks: Track[] = [];

  findAll(): Track[] {
    return this.tracks;
  }

  findOne(id: string): Track {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    const track = this.tracks.find((track) => track.id === id);
    if (!track) {
      throw new NotFoundException('Track not found');
    }
    return track;
  }

  create(createTrackDto: CreateTrackDto): Track {
    if (!createTrackDto.name || typeof createTrackDto.name !== 'string') {
      throw new BadRequestException('Name is required and must be a string');
    }
    if (typeof createTrackDto.duration !== 'number') {
      throw new BadRequestException('Duration must be a number');
    }
    if (createTrackDto.artistId !== null && !isUUID(createTrackDto.artistId)) {
      throw new BadRequestException('Invalid artist UUID');
    }
    if (createTrackDto.albumId !== null && !isUUID(createTrackDto.albumId)) {
      throw new BadRequestException('Invalid album UUID');
    }

    const track: Track = {
      id: randomUUID(),
      ...createTrackDto,
    };
    this.tracks.push(track);
    return track;
  }

  update(id: string, updateTrackDto: UpdateTrackDto): Track {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    const trackIndex = this.tracks.findIndex((track) => track.id === id);
    if (trackIndex === -1) {
      throw new NotFoundException('Track not found');
    }

    if (
      updateTrackDto.name !== undefined &&
      typeof updateTrackDto.name !== 'string'
    ) {
      throw new BadRequestException('Name must be a string');
    }
    if (
      updateTrackDto.duration !== undefined &&
      typeof updateTrackDto.duration !== 'number'
    ) {
      throw new BadRequestException('Duration must be a number');
    }
    if (
      updateTrackDto.artistId !== undefined &&
      updateTrackDto.artistId !== null &&
      !isUUID(updateTrackDto.artistId)
    ) {
      throw new BadRequestException('Invalid artist UUID');
    }
    if (
      updateTrackDto.albumId !== undefined &&
      updateTrackDto.albumId !== null &&
      !isUUID(updateTrackDto.albumId)
    ) {
      throw new BadRequestException('Invalid album UUID');
    }

    const updatedTrack: Track = {
      ...this.tracks[trackIndex],
      ...updateTrackDto,
    };

    this.tracks[trackIndex] = updatedTrack;
    return updatedTrack;
  }

  remove(id: string): void {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    const trackIndex = this.tracks.findIndex((track) => track.id === id);
    if (trackIndex === -1) {
      throw new NotFoundException('Track not found');
    }
    this.tracks.splice(trackIndex, 1);
  }

  removeArtist(artistId: string): void {
    this.tracks = this.tracks.map((track) => {
      if (track.artistId === artistId) {
        return { ...track, artistId: null };
      }
      return track;
    });
  }
}
