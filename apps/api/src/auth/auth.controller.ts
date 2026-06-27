import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { email: string; passwordRaw: string; companyName: string },
  ) {
    return this.authService.register(
      body.email,
      body.passwordRaw,
      body.companyName,
    );
  }

  @Post('login')
  async login(
    @Body() body: { email: string; passwordRaw: string },
  ) {
    return this.authService.login(body.email, body.passwordRaw);
  }
}