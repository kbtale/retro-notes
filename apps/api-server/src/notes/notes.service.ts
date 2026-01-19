import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Note } from './entities/note.entity';
import { Category } from '@/categories/entities/category.entity';
import { User } from '@/users/entities/user.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
    constructor(
        @InjectRepository(Note)
        private notesRepository: Repository<Note>,
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
    ) {}

    async create(user: User, createNoteDto: CreateNoteDto): Promise<Note> {
        const note = this.notesRepository.create({
            ...createNoteDto,
            user: { id: user.id } as User,
        });

        if (createNoteDto.categoryIds && createNoteDto.categoryIds.length > 0) {
            const categories = await this.categoriesRepository.find({
                where: {
                    id: In(createNoteDto.categoryIds),
                },
            });
            note.categories = categories;
        }

        return await this.notesRepository.save(note);
    }

    async findAll(
        user: User,
        filters?: {
            isArchived?: boolean;
            categoryId?: number;
            page?: number;
            limit?: number;
            sortBy?: 'updatedAt' | 'title' | 'createdAt';
            sortOrder?: 'ASC' | 'DESC';
        },
    ): Promise<{ data: Note[]; total: number; page: number; limit: number }> {
        const page = filters?.page ?? 1;
        const limit = filters?.limit ?? 10;
        const sortBy = filters?.sortBy ?? 'updatedAt';
        const sortOrder = filters?.sortOrder ?? 'DESC';

        const query = this.notesRepository
            .createQueryBuilder('note')
            .leftJoinAndSelect('note.categories', 'category')
            .where('note.userId = :userId', { userId: user.id });

        if (filters?.isArchived !== undefined) {
            query.andWhere('note.isArchived = :isArchived', {
                isArchived: filters.isArchived,
            });
        }

        if (filters?.categoryId) {
            query.andWhere('category.id = :categoryId', {
                categoryId: filters.categoryId,
            });
        }

        // Pinned notes first, then sort by specified field
        query
            .orderBy('note.isPinned', 'DESC')
            .addOrderBy(`note.${sortBy}`, sortOrder);

        const total = await query.getCount();
        const data = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();

        return { data, total, page, limit };
    }

    // Find one note by ID
    async findOne(user: User, id: number): Promise<Note> {
        const note = await this.notesRepository.findOne({
            where: { id, user: { id: user.id } },
            relations: ['categories'],
        });

        if (!note) {
            throw new NotFoundException(`Note with ID ${id} not found`);
        }

        return note;
    }

    // Update a note
    async update(
        user: User,
        id: number,
        updateNoteDto: UpdateNoteDto,
    ): Promise<Note> {
        const note = await this.findOne(user, id);

        // Extract DTO-only fields (categoryIds is handled separately via relation)
        const { categoryIds, ...entityFields } = updateNoteDto;

        // Update only entity-compatible fields
        Object.assign(note, entityFields);

        if (updateNoteDto.categoryIds !== undefined) {
            const categories = await this.categoriesRepository.find({
                where: {
                    id: In(updateNoteDto.categoryIds),
                },
            });
            note.categories = categories;
        }

        // Explicitly update timestamp for content changes
        note.updatedAt = new Date();

        return await this.notesRepository.save(note);
    }

    async remove(user: User, id: number): Promise<void> {
        const result = await this.notesRepository.delete({
            id,
            user: { id: user.id },
        });

        if (result.affected === 0) {
            throw new NotFoundException(`Note with ID ${id} not found`);
        }
    }

    async toggleArchive(user: User, id: number): Promise<Note> {
        const note = await this.findOne(user, id);
        await this.notesRepository.update(id, { isArchived: !note.isArchived });
        note.isArchived = !note.isArchived;
        return note;
    }

    async togglePin(user: User, id: number): Promise<Note> {
        const note = await this.findOne(user, id);
        await this.notesRepository.update(id, { isPinned: !note.isPinned });
        note.isPinned = !note.isPinned;
        return note;
    }

    // Get active notes (not archived)
    async findActive(user: User): Promise<{ data: Note[]; total: number; page: number; limit: number }> {
        return this.findAll(user, { isArchived: false });
    }

    // Get archived notes
    async findArchived(user: User): Promise<{ data: Note[]; total: number; page: number; limit: number }> {
        return this.findAll(user, { isArchived: true });
    }

    async addCategory(
        user: User,
        noteId: number,
        categoryId: number,
    ): Promise<Note> {
        const note = await this.findOne(user, noteId);
        const category = await this.categoriesRepository.findOne({
            where: { id: categoryId },
        });

        if (!category) {
            throw new NotFoundException(
                `Category with ID ${categoryId} not found`,
            );
        }

        if (!note.categories.some((c) => c.id === category.id)) {
            note.categories.push(category);
            return await this.notesRepository.save(note);
        }

        return note;
    }

    async removeCategory(
        user: User,
        noteId: number,
        categoryId: number,
    ): Promise<Note> {
        const note = await this.findOne(user, noteId);

        note.categories = note.categories.filter(
            (category) => category.id !== categoryId,
        );

        return await this.notesRepository.save(note);
    }
}
