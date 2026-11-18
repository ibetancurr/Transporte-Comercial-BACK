import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserRole } from '../shared/types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findDrivers(): Promise<Array<{ id: string; nombre: string; documento: string; rol: string }>> {
    return this.usersRepository.find({
      where: { rol: UserRole.DRIVER },
      select: ['id', 'nombre', 'documento', 'rol'],
      order: { nombre: 'ASC' },
    });
  }

  async findByDocument(documento: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { documento },
      select: ['id', 'nombre', 'documento', 'rol', 'passwordHash', 'creadoEn', 'preguntaSeguridad', 'respuestaHash'],
    });
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async create(data: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.usersRepository.update(id, { passwordHash });
  }
}
