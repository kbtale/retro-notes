import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@/users/entities/user.entity';
import {
    ValidatedUser,
    JwtPayload,
} from './interfaces/auth.interface';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(
        username: string,
        pass: string,
    ): Promise<ValidatedUser | null> {
        const user = await this.usersRepository.findOne({
            where: { username },
        });

        if (user && (await bcrypt.compare(pass, user.passwordHash))) {
            const result: ValidatedUser = {
                id: user.id,
                username: user.username,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };
            return result;
        }
        return null;
    }

    generateToken(user: ValidatedUser): string {
        const payload: JwtPayload = { username: user.username, sub: user.id };
        return this.jwtService.sign(payload);
    }

    async register(registerDto: RegisterDto): Promise<ValidatedUser> {
        const existingUser = await this.usersRepository.findOne({
            where: { username: registerDto.username },
        });

        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(registerDto.password, salt);

        const user = this.usersRepository.create({
            username: registerDto.username,
            passwordHash,
        });

        const savedUser = await this.usersRepository.save(user);

        return {
            id: savedUser.id,
            username: savedUser.username,
            createdAt: savedUser.createdAt,
            updatedAt: savedUser.updatedAt,
        };
    }
}

