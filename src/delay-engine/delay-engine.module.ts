import { Module, Controller, Post, Param, Req, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { RoutesModule } from '../routes/routes.module';
import { RoutesService } from '../routes/routes.service';
import { RoadIncidentsModule, RoadIncidentsService } from '../road-incidents/road-incidents.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserEntity } from '../users/entities/user.entity';
import { calculateDelay } from './calculate-delay';

@ApiTags('Retrasos') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('routes')
class DelayEngineController {
  constructor(private readonly routes: RoutesService, private readonly incidents: RoadIncidentsService) {}
  @Post(':id/evaluate-delay') async evaluate(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const route = await this.routes.findOwned(id, (req.user as UserEntity).id);
    const result = calculateDelay(route, await this.incidents.active());
    route.etaRecalculado = new Date(result.recalculatedEta);
    await this.routes.save(route);
    return result;
  }
}

@Module({ imports: [RoutesModule, RoadIncidentsModule], controllers: [DelayEngineController] })
export class DelayEngineModule {}
