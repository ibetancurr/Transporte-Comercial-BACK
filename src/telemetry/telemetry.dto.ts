import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, ArrayMinSize, ArrayMaxSize, ValidateNested, IsLatitude, IsLongitude, IsOptional, IsNumber, Min, Max, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';

export class TelemetryPointDto {
  @ApiProperty()
  @IsLatitude() latitude: number;
  @ApiProperty()
  @IsLongitude() longitude: number;
  @ApiProperty({ required: false })
  @IsOptional() @IsNumber() @Min(0) speedKmh?: number;
  @ApiProperty({ required: false })
  @IsOptional() @IsNumber() altitude?: number;
  @ApiProperty({ required: false })
  @IsOptional() @IsNumber() @Min(0) @Max(100) batteryLevel?: number;
  @ApiProperty()
  @IsISO8601() capturedAt: string;
}
export class TelemetryBatchDto {
  @ApiProperty()
  @IsUUID() routeId: string;
  @ApiProperty({ type: () => [TelemetryPointDto] })
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(1000) @ValidateNested({ each: true }) @Type(() => TelemetryPointDto) points: TelemetryPointDto[];
}

