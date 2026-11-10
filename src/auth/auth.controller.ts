import { Controller, Post, Get, Req, UseGuards, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MobileEmailDto, MobileLoginDto, MobileRegisterDto, MobileAnswerDto, MobileResetDto } from './dto/mobile-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserEntity } from '../users/entities/user.entity';
import { Request } from 'express';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('mobile/register')
  mobileRegister(@Body() dto: MobileRegisterDto) { return this.authService.registerMobile(dto); }

  @Post('mobile/login') @HttpCode(HttpStatus.OK)
  async mobileLogin(@Body() dto: MobileLoginDto) {
    const result = await this.authService.login({ documento: dto.correo.trim().toLowerCase(), password: dto.contrasena });
    return { token: result.token, usuario: { id: result.usuario.id, nombre: result.usuario.nombre, correo: result.usuario.documento } };
  }

  @Get('me') @UseGuards(JwtAuthGuard)
  me(@Req() req: Request) {
    const user = req.user as UserEntity;
    return { id: user.id, nombre: user.nombre, correo: user.documento, rol: user.rol };
  }

  @Post('mobile/recovery/question') @HttpCode(HttpStatus.OK)
  question(@Body() dto: MobileEmailDto) { return this.authService.mobileQuestion(dto.correo); }

  @Post('mobile/recovery/verify') @HttpCode(HttpStatus.OK)
  async verify(@Body() dto: MobileAnswerDto) {
    await this.authService.verifyMobileAnswer(dto.correo, dto.respuesta);
    return { ok: true };
  }

  @Post('mobile/recovery/reset') @HttpCode(HttpStatus.OK)
  reset(@Body() dto: MobileResetDto) { return this.authService.resetMobilePassword(dto.correo, dto.respuesta, dto.nuevaContrasena); }

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario conductor u operador' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT' })
  @ApiResponse({ status: 200, description: 'Sesión iniciada exitosamente' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
