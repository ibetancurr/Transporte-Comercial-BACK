import { TelemetryBatchDto } from './telemetry.dto';
import { Module, Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Repository } from 'typeorm';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { RouteEntity } from '../routes/entities/route.entity';
import { RoutesModule } from '../routes/routes.module';
import { RoutesService } from '../routes/routes.service';
import { UserEntity } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Entity('telemetria_puntos')
export class TelemetryEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') routeId: string;
  @ManyToOne(() => RouteEntity, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'routeId' }) route: RouteEntity;
  @Column('double precision') latitude: number;
  @Column('double precision') longitude: number;
  @Column({ type: 'double precision', nullable: true }) speedKmh?: number;
  @Column({ type: 'double precision', nullable: true }) altitude?: number;
  @Column({ type: 'double precision', nullable: true }) batteryLevel?: number;
  @Column('timestamptz') capturedAt: Date;
}

@ApiTags('Telemetría') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('telemetry')
class TelemetryController {
  constructor(@InjectRepository(TelemetryEntity) private readonly points: Repository<TelemetryEntity>, private readonly routes: RoutesService) {}
  @Post('batch') async batch(@Body() dto: TelemetryBatchDto, @Req() req: Request) {
    await this.routes.findOwned(dto.routeId, (req.user as UserEntity).id);
    const entities = dto.points.map((point) => this.points.create({ ...point, routeId: dto.routeId, capturedAt: new Date(point.capturedAt) }));
    await this.points.save(entities);
    return { savedCount: entities.length };
  }
}

@Module({ imports: [TypeOrmModule.forFeature([TelemetryEntity]), RoutesModule], controllers: [TelemetryController] })
export class TelemetryModule {}
