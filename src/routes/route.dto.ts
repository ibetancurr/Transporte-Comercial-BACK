import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsLatitude, IsLongitude, IsNumber, Min, IsOptional, IsEnum, IsISO8601, IsArray, ValidateNested, IsInt, IsUUID } from 'class-validator';
import { RouteStatus } from '../shared/types';

export class SegmentDto {
  @ApiProperty()
  @IsUUID() id: string;
  @ApiProperty()
  @IsInt() @Min(0) ordenSecuencia: number;
  @ApiProperty()
  @IsLatitude() origenLat: number;
  @ApiProperty()
  @IsLongitude() origenLon: number;
  @ApiProperty()
  @IsLatitude() destinoLat: number;
  @ApiProperty()
  @IsLongitude() destinoLon: number;
  @ApiProperty({ required: false })
  @IsOptional() @IsString() viaCodigo?: string;
  @ApiProperty()
  @IsNumber() @Min(0) distanciaKm: number;
  @ApiProperty()
  @IsNumber() @Min(0) tiempoBaseMin: number;
}

export class CreateRouteDto {
  @ApiProperty({ required: false })
  @IsOptional() @IsUUID() conductorId?: string;
  @ApiProperty({ required: false })
  @IsOptional() @IsString() codigoManifiesto?: string;
  @ApiProperty()
  @IsString() @IsNotEmpty() origenNombre: string;
  @ApiProperty()
  @IsLatitude() origenLat: number;
  @ApiProperty()
  @IsLongitude() origenLon: number;
  @ApiProperty()
  @IsString() @IsNotEmpty() destinoNombre: string;
  @ApiProperty()
  @IsLatitude() destinoLat: number;
  @ApiProperty()
  @IsLongitude() destinoLon: number;
  @ApiProperty()
  @IsISO8601() etaPactado: string;
  @ApiProperty()
  @IsNumber() @Min(0) distanciaTotalKm: number;
  @ApiProperty()
  @IsNumber() @Min(0) tiempoEstimadoBaseMin: number;
  @ApiProperty({ required: false })
  @IsOptional() @IsEnum(RouteStatus) estado?: RouteStatus;
  @ApiProperty({ type: () => [SegmentDto], required: false })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SegmentDto) tramos?: SegmentDto[];
}

export class UpdateRouteStatusDto {
  @ApiProperty({ enum: RouteStatus })
  @IsEnum(RouteStatus)
  estado: RouteStatus;
}
