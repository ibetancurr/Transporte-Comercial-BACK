import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { UserRole } from '../../shared/types';
import { RouteEntity } from '../../routes/entities/route.entity';

@Entity('usuarios')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  // Legacy document login and mobile email login share this unique identifier.
  @Column({ type: 'varchar', length: 254, unique: true })
  documento: string;

  @Column({ type: 'varchar', nullable: true })
  preguntaSeguridad?: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  respuestaHash?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.DRIVER,
  })
  rol: UserRole;

  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @OneToMany(() => RouteEntity, (route) => route.usuario)
  rutas: RouteEntity[];

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
