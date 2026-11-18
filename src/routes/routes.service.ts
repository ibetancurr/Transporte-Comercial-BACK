import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteEntity } from './entities/route.entity';
import { CreateRouteDto } from './route.dto';
import { RouteStatus } from '../shared/types';

@Injectable()
export class RoutesService {
  constructor(@InjectRepository(RouteEntity) private readonly routes: Repository<RouteEntity>) {}

  list(usuarioId: string, rol?: string) {
    if (rol === 'operador') {
      return this.routes.find({
        relations: ['usuario'],
        order: { etaPactado: 'ASC' },
      });
    }
    return this.routes.find({
      where: { usuarioId },
      relations: ['usuario'],
      order: { etaPactado: 'ASC' },
    });
  }

  async findOwned(id: string, usuarioId: string) {
    const route = await this.routes.findOne({
      where: { id, usuarioId },
      relations: ['usuario'],
    });
    if (!route) throw new NotFoundException('Ruta no encontrada');
    return route;
  }

  async create(dto: CreateRouteDto, usuarioId: string) {
    const targetUserId = dto.conductorId || usuarioId;
    const entity = this.routes.create({
      ...dto,
      usuarioId: targetUserId,
      etaPactado: new Date(dto.etaPactado),
    });
    const saved = await this.routes.save(entity);
    return this.routes.findOne({ where: { id: saved.id }, relations: ['usuario'] });
  }

  async updateStatus(id: string, estado: RouteStatus, user: { id: string; rol?: string }) {
    const where = user.rol === 'operador' ? { id } : { id, usuarioId: user.id };
    const route = await this.routes.findOne({ where, relations: ['usuario'] });
    if (!route) throw new NotFoundException('Ruta no encontrada o no autorizada');

    // Regla de negocio: un conductor solo puede tener 1 viaje en curso a la vez
    if (estado === RouteStatus.IN_TRANSIT) {
      const activeTrip = await this.routes.findOne({
        where: [
          { usuarioId: route.usuarioId, estado: RouteStatus.IN_TRANSIT },
          { usuarioId: route.usuarioId, estado: RouteStatus.SUSPENDED },
        ],
      });
      if (activeTrip && activeTrip.id !== id) {
        throw new BadRequestException(
          `El conductor ya tiene un viaje activo en curso (${activeTrip.codigoManifiesto || activeTrip.origenNombre + ' → ' + activeTrip.destinoNombre}). Debe finalizarlo antes de iniciar uno nuevo.`,
        );
      }
    }

    route.estado = estado;
    return this.routes.save(route);
  }

  save(route: RouteEntity) { return this.routes.save(route); }
}
