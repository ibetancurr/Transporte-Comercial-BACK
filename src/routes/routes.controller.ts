import { Controller, Get, Post, Body, Param, Req, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserEntity } from '../users/entities/user.entity';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './route.dto';

@ApiTags('Rutas') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('routes')
export class RoutesController {
  constructor(private readonly routes: RoutesService) {}
  @Get() list(@Req() req: Request) {
    const user = req.user as UserEntity;
    return this.routes.list(user.id, user.rol);
  }
  @Post() create(@Body() dto: CreateRouteDto, @Req() req: Request) { return this.routes.create(dto, (req.user as UserEntity).id); }
  @Get(':id') get(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) { return this.routes.findOwned(id, (req.user as UserEntity).id); }
}
