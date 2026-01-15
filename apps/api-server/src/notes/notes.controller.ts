import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { User } from '@/users/entities/user.entity';
import { Note } from './entities/note.entity';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
    constructor(private readonly notesService: NotesService) {}

    @Post()
    create(
        @GetUser() user: User,
        @Body() createNoteDto: CreateNoteDto,
    ): Promise<Note> {
        return this.notesService.create(user, createNoteDto);
    }

    @Get()
    findAll(
        @GetUser() user: User,
        @Query('categoryId') categoryId?: number,
    ): Promise<Note[]> {
        const filters = categoryId ? { categoryId: Number(categoryId) } : {};
        return this.notesService.findAll(user, filters);
    }

    @Get('active')
    findActive(@GetUser() user: User): Promise<Note[]> {
        return this.notesService.findActive(user);
    }

    @Get('archived')
    findArchived(@GetUser() user: User): Promise<Note[]> {
        return this.notesService.findArchived(user);
    }

    @Get(':id')
    findOne(
        @GetUser() user: User,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<Note> {
        return this.notesService.findOne(user, id);
    }

    @Patch(':id')
    update(
        @GetUser() user: User,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateNoteDto: UpdateNoteDto,
    ): Promise<Note> {
        return this.notesService.update(user, id, updateNoteDto);
    }

    @Delete(':id')
    remove(
        @GetUser() user: User,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        return this.notesService.remove(user, id);
    }

    @Patch(':id/archive')
    toggleArchive(
        @GetUser() user: User,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<Note> {
        return this.notesService.toggleArchive(user, id);
    }

    @Post(':noteId/categories/:categoryId')
    addCategory(
        @GetUser() user: User,
        @Param('noteId', ParseIntPipe) noteId: number,
        @Param('categoryId', ParseIntPipe) categoryId: number,
    ): Promise<Note> {
        return this.notesService.addCategory(user, noteId, categoryId);
    }

    @Delete(':noteId/categories/:categoryId')
    removeCategory(
        @GetUser() user: User,
        @Param('noteId', ParseIntPipe) noteId: number,
        @Param('categoryId', ParseIntPipe) categoryId: number,
    ): Promise<Note> {
        return this.notesService.removeCategory(user, noteId, categoryId);
    }
}
