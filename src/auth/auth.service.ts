import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MobileRegisterDto } from './dto/mobile-auth.dto';
import { UserRole } from '../shared/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async registerMobile(dto: MobileRegisterDto) {
    const correo = dto.correo.trim().toLowerCase();
    if (await this.usersService.findByDocument(correo)) throw new ConflictException('Este correo ya está registrado');
    const user = await this.usersService.create({
      nombre: dto.nombre.trim(), documento: correo, rol: UserRole.DRIVER,
      passwordHash: await bcrypt.hash(dto.contrasena, 10),
      preguntaSeguridad: dto.preguntaSeguridad.trim(),
      respuestaHash: await bcrypt.hash(dto.respuestaSeguridad.trim().toLowerCase(), 10),
    });
    return { usuario: { id: user.id, nombre: user.nombre, correo }, token: this.generateToken(user.id, user.documento, user.rol) };
  }

  async mobileQuestion(correo: string) {
    const user = await this.usersService.findByDocument(correo.trim().toLowerCase());
    if (!user?.preguntaSeguridad) throw new UnauthorizedException('No se pudo recuperar la cuenta');
    return { pregunta: user.preguntaSeguridad };
  }

  async verifyMobileAnswer(correo: string, respuesta: string) {
    const user = await this.usersService.findByDocument(correo.trim().toLowerCase());
    if (!user?.respuestaHash || !await bcrypt.compare(respuesta.trim().toLowerCase(), user.respuestaHash)) {
      throw new UnauthorizedException('La respuesta de seguridad no es correcta');
    }
    return user;
  }

  async resetMobilePassword(correo: string, respuesta: string, password: string) {
    const user = await this.verifyMobileAnswer(correo, respuesta);
    await this.usersService.updatePassword(user.id, await bcrypt.hash(password, 10));
    return { ok: true };
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findByDocument(registerDto.documento);
    if (existing) {
      throw new ConflictException('El documento ya está registrado en el sistema');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    const user = await this.usersService.create({
      nombre: registerDto.nombre,
      documento: registerDto.documento,
      rol: registerDto.rol,
      passwordHash,
    });

    const token = this.generateToken(user.id, user.documento, user.rol);
    return {
      usuario: { id: user.id, nombre: user.nombre, rol: user.rol, documento: user.documento },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByDocument(loginDto.documento);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.generateToken(user.id, user.documento, user.rol);
    return {
      usuario: { id: user.id, nombre: user.nombre, rol: user.rol, documento: user.documento },
      token,
    };
  }

  private generateToken(userId: string, documento: string, rol: string): string {
    const payload = { sub: userId, documento, rol };
    return this.jwtService.sign(payload);
  }
}
