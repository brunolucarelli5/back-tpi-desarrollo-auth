import { Injectable, UnauthorizedException } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import * as moment from 'moment';
import { Payload } from 'src/interfaces/payload';

@Injectable()
export class JwtService {
  // config.ts
  config = {
    auth: {
      secret: 'authSecret',
      expiresIn: '15m',
    },
    refresh: {
      secret: 'refreshSecret',
      expiresIn: '1d',
    },
  };
  generateToken(
    payload: { email: string },
    type: 'refresh' | 'auth' = 'auth',
  ): string {
    return sign(payload, this.config[type].secret, {
      expiresIn: this.config[type].expiresIn,
    });
  }

  refreshToken(refreshToken: string) {

    console.log('El refreshToken que recibe el refreshToken es', refreshToken)
    try {
      const payload = verify(
        refreshToken,
        this.config.refresh.secret,
      ) as Payload;
      console.log('El payload que recibe el refreshToken es', payload)
      const currentTime = Math.floor(Date.now() / 1000);
      const timeToExpire = (payload.exp - currentTime) / 60;
      console.log(timeToExpire)
      if (timeToExpire < 20) {
        console.log('Entro al if de timeToExpire')
        return {
          accessToken: this.generateToken({ email: payload.email }, 'auth'),
          refreshToken: this.generateToken({ email: payload.email }, 'refresh'),
          expirationTime: moment().add(10, 'minutes').toDate()
        };
      }
      return {
        accessToken: this.generateToken({ email: payload.email }, 'auth'),
        expirationTime: moment().add(10, 'minutes').toDate()
      };
    } catch (error) {
      console.log("El error que ocurrió en refreshToken es:", error)
      throw new UnauthorizedException();
    }
  }


  getPayload(token: string, type: 'refresh' | 'auth' = 'auth') {
    console.log('Entro a getPayload')
    const tokenSinBearer = token.split(' ')[1];
    console.log('El token que recibe getpayload es:', tokenSinBearer)
    return verify(tokenSinBearer, this.config[type].secret);
  }
}
