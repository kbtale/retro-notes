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
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { User } from '@/users/entities/user.entity';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
    constructor(private readonly notesService: NotesService) {}

    @Post()
    create(@GetUser() user: User, @Body() createNoteDto: CreateNoteDto) {
        return this.notesService.create(user, createNoteDto);
    }

    @Get()
    findAll(
        @GetUser() user: User,
        @Query('categoryId') categoryId?: number,
    ) {
        const filters = categoryId ? { categoryId: Number(categoryId) } : {};
        return this.notesService.findAll(user, filters);
    }

    @Get('active')
    findActive(@GetUser() user: User) {
        return this.notesService.findActive(user);
    }

    @Get('archived')
    findArchived(@GetUser() user: User) {
        return this.notesService.findArchived(user);
    }

    @Get(':id')
    findOne(@GetUser() user: User, @Param('id') id: string) {
        return this.notesService.findOne(user, parseInt(id));
    }

    @Patch(':id')
    update(
        @GetUser() user: User,
        @Param('id') id: string,
        @Body() updateNoteDto: UpdateNoteDto,
    ) {
        return this.notesService.update(user, parseInt(id), updateNoteDto);
    }

    @Delete(':id')
    remove(@GetUser() user: User, @Param('id') id: string) {
        return this.notesService.remove(user, parseInt(id));
    }

    @Patch(':id/archive')
    toggleArchive(@GetUser() user: User, @Param('id') id: string) {
        return this.notesService.toggleArchive(user, parseInt(id));
    }

    @Post(':noteId/categories/:categoryId')
    addCategory(
        @GetUser() user: User,
        @Param('noteId') noteId: string,
        @Param('categoryId') categoryId: string,
    ) {
        return this.notesService.addCategory(
            user,
            parseInt(noteId),
            parseInt(categoryId),
        );
    }

    @Delete(':noteId/categories/:categoryId')
    removeCategory(
        @GetUser() user: User,
        @Param('noteId') noteId: string,
        @Param('categoryId') categoryId: string,
    ) {
        return this.notesService.removeCategory(
            user,
            parseInt(noteId),
            parseInt(categoryId),
        );
    }
}