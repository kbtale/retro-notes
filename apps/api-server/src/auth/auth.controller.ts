import {
    Controller,
    Post,
    Get,
    Body,
    Res,
    UseGuards,
    HttpCode,
    HttpStatus,
    UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './interfaces/auth.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthResponse> {
        const validUser = await this.authService.validateUser(
            loginDto.username,
            loginDto.password,
        );

        if (!validUser) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.authService.generateToken(validUser);
        this.setAuthCookie(res, token);

        return {
            success: true,
            user: { id: validUser.id, username: validUser.username },
        };
    }

    @Post('register')
    async register(
        @Body() registerDto: RegisterDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthResponse> {
        const user = await this.authService.register(registerDto);
        const token = this.authService.generateToken(user);
        this.setAuthCookie(res, token);

        return {
            success: true,
            user: { id: user.id, username: user.username },
        };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@Res({ passthrough: true }) res: Response): { success: boolean } {
        res.clearCookie('access_token', this.getCookieOptions());
        return { success: true };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    me(
        @GetUser() user: { userId: number; username: string },
    ): { id: number; username: string } {
        return { id: user.userId, username: user.username };
    }

    private setAuthCookie(res: Response, token: string): void {
        res.cookie('access_token', token, {
            ...this.getCookieOptions(),
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
    }

    private getCookieOptions(): {
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'lax' | 'strict' | 'none';
    } {
        return {
            httpOnly: true,
            secure: this.configService.get('NODE_ENV') === 'production',
            sameSite: 'lax',
        };
    }
}
