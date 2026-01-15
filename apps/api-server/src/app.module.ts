import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NotesModule } from './notes/notes.module';
import { CategoriesModule } from './categories/categories.module';
import { Note } from './notes/entities/note.entity';
import { Category } from './categories/entities/category.entity';
import { User } from './users/entities/user.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                url: configService.get('DATABASE_URL'),
                entities: [Note, Category, User],
                synchronize: configService.get('NODE_ENV') !== 'production',
                ssl: {
                    rejectUnauthorized: false,
                },
            }),
        }),
        AuthModule,
        UsersModule,
        NotesModule,
        CategoriesModule,
    ],
})
export class AppModule {}