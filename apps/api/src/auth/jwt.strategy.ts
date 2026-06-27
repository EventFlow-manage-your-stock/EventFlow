import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Wyciągaj token z nagłówka Authorization jako Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  // Ta metoda uruchomi się TYLKO, gdy token będzie poprawny i ważny
  async validate(payload: any) {
    // To, co tu zwrócimy, NestJS automatycznie wstrzyknie do obiektu żądania jako `request.user`
    return { 
      userId: payload.sub, 
      email: payload.email, 
      tenantId: payload.tenantId, 
      role: payload.role 
    };
  }
}