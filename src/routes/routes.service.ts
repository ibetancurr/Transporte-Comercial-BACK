import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteEntity } from './entities/route.entity';
import { CreateRouteDto } from './route.dto';

@Injectable()
export class RoutesService {
  constructor(@InjectRepository(RouteEntity) private readonly routes: Repository<RouteEntity>) {}
  list(usuarioId: string) { return this.routes.find({ where: { usuarioId }, order: { etaPactado: 'ASC' } }); }
  async findOwned(id: string, usuarioId: string) {
    const route = await this.routes.findOne({ where: { id, usuarioId } });
    if (!route) throw new NotFoundException('Ruta no encontrada');
    return route;
  }
  create(dto: CreateRouteDto, usuarioId: string) {
    return this.routes.save(this.routes.create({ ...dto, usuarioId, etaPactado: new Date(dto.etaPactado) }));
  }
  save(route: RouteEntity) { return this.routes.save(route); }
}
