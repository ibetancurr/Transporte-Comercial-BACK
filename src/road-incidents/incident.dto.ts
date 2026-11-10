import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty, IsLatitude, IsLongitude, IsNumber, Min, IsOptional, IsIn } from 'class-validator';
import { IncidentType, IncidentSeverity } from '../shared/types';

export class CreateIncidentDto {
  @ApiProperty({ required: false })
  @IsOptional() @IsString() idFuenteExterna?: string;
  @ApiProperty()
  @IsEnum(IncidentType) tipoEvento: IncidentType;
  @ApiProperty()
  @IsEnum(IncidentSeverity) gravedad: IncidentSeverity;
  @ApiProperty()
  @IsString() @IsNotEmpty() descripcion: string;
  @ApiProperty({ required: false })
  @IsOptional() @IsString() viaCodigo?: string;
  @ApiProperty()
  @IsLatitude() latitud: number;
  @ApiProperty()
  @IsLongitude() longitud: number;
  @ApiProperty()
  @IsNumber() @Min(0) radioAfectacionKm: number;
  @ApiProperty()
  @IsNumber() @Min(0) retrasoEstimadoMin: number;
  @ApiProperty({ required: false })
  @IsOptional() @IsString() fuente?: string;
}
export class IncidentStateDto {
  @ApiProperty()
  @IsIn(['activo', 'resuelto']) estado: string;
}
