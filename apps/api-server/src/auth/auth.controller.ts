import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    const validUser = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    if (!validUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(validUser);
  }
}