import { Controller, Get, Post, Patch, Put, Body, Param, Req, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserEntity } from '../users/entities/user.entity';
import { RoutesService } from './routes.service';
import { CreateRouteDto, UpdateRouteStatusDto } from './route.dto';

@ApiTags('Rutas') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('routes')
export class RoutesController {
  constructor(private readonly routes: RoutesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar rutas (propias para conductor, todas para operador)' })
  list(@Req() req: Request) {
    const user = req.user as UserEntity;
    return this.routes.list(user.id, user.rol);
  }

  @Post()
  @ApiOperation({ summary: 'Crear o despachar una nueva ruta' })
  create(@Body() dto: CreateRouteDto, @Req() req: Request) {
    return this.routes.create(dto, (req.user as UserEntity).id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de ruta' })
  get(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.routes.findOwned(id, (req.user as UserEntity).id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de la ruta' })
  patchStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRouteStatusDto,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    return this.routes.updateStatus(id, dto.estado, user);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de la ruta (alias PUT)' })
  putStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRouteStatusDto,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    return this.routes.updateStatus(id, dto.estado, user);
  }
}
