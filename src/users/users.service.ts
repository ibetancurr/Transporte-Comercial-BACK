import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserRole, RouteStatus } from '../shared/types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findDrivers(): Promise<Array<{
    id: string;
    nombre: string;
    documento: string;
    rol: string;
    viajeActivo?: { id: string; codigoManifiesto?: string; origen: string; destino: string; estado: string } | null;
  }>> {
    const drivers = await this.usersRepository.find({
      where: { rol: UserRole.DRIVER },
      relations: ['rutas'],
      order: { nombre: 'ASC' },
    });

    return drivers.map((d) => {
      const active = d.rutas?.find(
        (r) => r.estado === RouteStatus.IN_TRANSIT || r.estado === RouteStatus.SUSPENDED,
      );
      return {
        id: d.id,
        nombre: d.nombre,
        documento: d.documento,
        rol: d.rol,
        viajeActivo: active
          ? {
              id: active.id,
              codigoManifiesto: active.codigoManifiesto,
              origen: active.origenNombre,
              destino: active.destinoNombre,
              estado: active.estado,
            }
          : null,
      };
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
