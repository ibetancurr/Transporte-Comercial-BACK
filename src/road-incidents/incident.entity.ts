import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { IncidentType, IncidentSeverity } from '../shared/types';

@Entity('incidentes_viales')
export class IncidentEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', nullable: true }) idFuenteExterna?: string;
  @Column({ type: 'enum', enum: IncidentType }) tipoEvento: IncidentType;
  @Column({ type: 'enum', enum: IncidentSeverity }) gravedad: IncidentSeverity;
  @Column('text') descripcion: string;
  @Column({ type: 'varchar', nullable: true }) viaCodigo?: string;
  @Column('double precision') latitud: number;
  @Column('double precision') longitud: number;
  @Column('double precision') radioAfectacionKm: number;
  @Column('double precision') retrasoEstimadoMin: number;
  @Column({ default: 'manual' }) fuente: string;
  @Column({ default: 'activo' }) estado: string;
  @CreateDateColumn({ type: 'timestamptz' }) fechaReporte: Date;
}
