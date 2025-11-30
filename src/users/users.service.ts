import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User, UserWithoutPassword } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class UsersService {
  private users: User[] = [];

  findAll(): UserWithoutPassword[] {
    return this.users.map((user) => ({
      id: user.id,
      login: user.login,
      version: user.version,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  findOne(id: string): UserWithoutPassword {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      login: user.login,
      version: user.version,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  findByLogin(login: string): User {
    const foundUser = this.users.find((user) => user.login === login);
    if (!foundUser) {
      throw new NotFoundException('User not found');
    }
    return foundUser;
  }

  create(createUserDto: CreateUserDto): UserWithoutPassword {
    const newUser: User = {
      id: randomUUID(),
      ...createUserDto,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.users.push(newUser);
    return {
      id: newUser.id,
      login: newUser.login,
      version: newUser.version,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
  }

  update(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): UserWithoutPassword {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }

    const currentUser = this.users[userIndex];
    if (currentUser.password !== updatePasswordDto.oldPassword) {
      throw new ForbiddenException('Old password is wrong');
    }

    const updatedUser: User = {
      ...currentUser,
      password: updatePasswordDto.newPassword,
      version: currentUser.version + 1,
      updatedAt: Date.now(),
    };

    this.users[userIndex] = updatedUser;
    return {
      id: updatedUser.id,
      login: updatedUser.login,
      version: updatedUser.version,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  remove(id: string): void {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }
    this.users.splice(userIndex, 1);
  }
}
