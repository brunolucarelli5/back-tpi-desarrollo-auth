import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from './../jwt/jwt.service';
import { UserEntity } from '../entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      console.log('AuthGuard')
      console.log('El authguard está recibiendo lo siguiente:', context.switchToHttp().getRequest().headers)
      const request: Request & { user: UserEntity } = context
        .switchToHttp()
        .getRequest();
      const token = request.headers.authorization;
      console.log(token)
      if (token == null) {
        throw new UnauthorizedException('El token no existe');
      }
      const payload = this.jwtService.getPayload(token);
      console.log('El payload es:', payload)
      const user = await this.usersService.findByEmail(payload.email);
      console.log('El usuario es:', user)
      request.user = user;
      console.log('El request.user es:', request.user)
      return true;
    }
    catch (error) {
      console.log(error);
      throw new UnauthorizedException(error?.message);
    }
  }
}