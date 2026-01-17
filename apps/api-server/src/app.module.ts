import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NotesModule } from './notes/notes.module';
import { CategoriesModule } from './categories/categories.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { Note } from './notes/entities/note.entity';
import { Category } from './categories/entities/category.entity';
import { User } from './users/entities/user.entity';
import { Attachment } from './attachments/entities/attachment.entity';

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
                entities: [Note, Category, User, Attachment],
                synchronize: configService.get('NODE_ENV') !== 'production',

                logging: false, // Disable verbose logging
            }),
        }),
        AuthModule,
        UsersModule,
        NotesModule,
        CategoriesModule,
        AttachmentsModule,
    ],
})
export class AppModule {}