import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
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

    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<LoginResponse> {
        return this.authService.register(registerDto);
    }
}

