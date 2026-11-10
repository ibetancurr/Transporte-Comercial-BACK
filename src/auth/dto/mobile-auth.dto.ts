import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class MobileEmailDto {
  @ApiProperty()
  @IsEmail() @MaxLength(254) correo: string;
}
export class MobileLoginDto extends MobileEmailDto {
  @ApiProperty()
  @IsString() @MinLength(6) @MaxLength(72) contrasena: string;
}
export class MobileRegisterDto extends MobileLoginDto {
  @ApiProperty()
  @IsString() @MinLength(2) @MaxLength(150) nombre: string;
  @ApiProperty()
  @IsString() @MinLength(3) @MaxLength(255) preguntaSeguridad: string;
  @ApiProperty()
  @IsString() @MinLength(1) @MaxLength(72) respuestaSeguridad: string;
}
export class MobileAnswerDto extends MobileEmailDto {
  @ApiProperty()
  @IsString() @MinLength(1) @MaxLength(72) respuesta: string;
}
export class MobileResetDto extends MobileAnswerDto {
  @ApiProperty()
  @IsString() @MinLength(6) @MaxLength(72) nuevaContrasena: string;
}
