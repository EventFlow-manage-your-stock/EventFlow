import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @Post('register')
  // async register(
  //   @Body() body: { email: string; passwordRaw: string; companyName: string },
  // ) {
  //   return this.authService.register(
  //     body.email,
  //     body.passwordRaw,
  //     body.companyName,
  //   );
  // }
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: { email: string; passwordRaw: string }) {
    // Przekazujemy odebrane parametry prosto do serwisu
    return this.authService.login(body.email, body.passwordRaw);
  }
}