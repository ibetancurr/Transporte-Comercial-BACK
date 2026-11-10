import { Module, Injectable, Controller, Get, Post, Patch, Body, Param, Req, UseGuards, ForbiddenException, NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { IncidentEntity } from './incident.entity';
import { CreateIncidentDto, IncidentStateDto } from './incident.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserEntity } from '../users/entities/user.entity';
import { UserRole } from '../shared/types';

@Injectable()
export class RoadIncidentsService {
  constructor(@InjectRepository(IncidentEntity) private readonly incidents: Repository<IncidentEntity>) {}
  active() { return this.incidents.find({ where: { estado: 'activo' }, order: { fechaReporte: 'DESC' } }); }
  create(dto: CreateIncidentDto) { return this.incidents.save(this.incidents.create(dto)); }
  async updateState(id: string, estado: string) {
    const incident = await this.incidents.findOneBy({ id });
    if (!incident) throw new NotFoundException('Incidente no encontrado');
    incident.estado = estado;
    return this.incidents.save(incident);
  }
}

@ApiTags('Incidentes') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('road-incidents')
class RoadIncidentsController {
  constructor(private readonly incidents: RoadIncidentsService) {}
  @Get() list() { return this.incidents.active(); }
  @Post() create(@Body() dto: CreateIncidentDto, @Req() req: Request) {
    this.requireOperator(req);
    return this.incidents.create(dto);
  }
  @Patch(':id') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: IncidentStateDto, @Req() req: Request) {
    this.requireOperator(req);
    return this.incidents.updateState(id, dto.estado);
  }
  private requireOperator(req: Request) {
    if ((req.user as UserEntity).rol !== UserRole.DISPATCHER) throw new ForbiddenException('Se requiere rol operador');
  }
}

@Module({ imports: [TypeOrmModule.forFeature([IncidentEntity])], providers: [RoadIncidentsService], controllers: [RoadIncidentsController], exports: [RoadIncidentsService] })
export class RoadIncidentsModule {}
