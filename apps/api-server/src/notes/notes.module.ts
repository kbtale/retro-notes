import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesService } from './notes.service';

import { NotesController } from './notes.controller';
import { Note } from './entities/note.entity';
import { Category } from '../categories/entities/category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Note, Category])],
    controllers: [NotesController],
    providers: [NotesService],
    exports: [NotesService],
})
export class NotesModule {}