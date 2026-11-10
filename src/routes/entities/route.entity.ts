import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { RouteStatus } from '../../shared/types';

export interface RouteSegment {
  id: string;
  ordenSecuencia: number;
  origenLat: number;
  origenLon: number;
  destinoLat: number;
  destinoLon: number;
  viaCodigo?: string;
  distanciaKm: number;
  tiempoBaseMin: number;
}

@Entity('rutas_entrega')
export class RouteEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') usuarioId: string;
  @ManyToOne(() => UserEntity, (user) => user.rutas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' }) usuario: UserEntity;
  @Column({ type: 'varchar', nullable: true }) codigoManifiesto?: string;
  @Column() origenNombre: string;
  @Column('double precision') origenLat: number;
  @Column('double precision') origenLon: number;
  @Column() destinoNombre: string;
  @Column('double precision') destinoLat: number;
  @Column('double precision') destinoLon: number;
  @Column('timestamptz') etaPactado: Date;
  @Column({ type: 'timestamptz', nullable: true }) etaRecalculado?: Date;
  @Column('double precision') distanciaTotalKm: number;
  @Column('double precision') tiempoEstimadoBaseMin: number;
  @Column({ type: 'enum', enum: RouteStatus, default: RouteStatus.PENDING }) estado: RouteStatus;
  @Column({ type: 'jsonb', default: () => "'[]'" }) tramos: RouteSegment[];
}
