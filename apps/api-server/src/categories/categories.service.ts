import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from '@/users/entities/user.entity';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
    ) {}

    async create(
        user: User,
        createCategoryDto: CreateCategoryDto,
    ): Promise<Category> {
        // Check if user already has a category with this name
        const existingCategory = await this.categoriesRepository.findOne({
            where: { name: createCategoryDto.name, user: { id: user.id } },
        });

        if (existingCategory) {
            throw new ConflictException(
                'You already have a category with this name',
            );
        }

        const category = this.categoriesRepository.create({
            ...createCategoryDto,
            user, // Associate with user (not global)
        });
        return await this.categoriesRepository.save(category);
    }

    // Get all categories available to a user (their own + global)
    async findAllForUser(user: User): Promise<Category[]> {
        return await this.categoriesRepository.find({
            where: [{ user: { id: user.id } }, { user: IsNull() }],
            relations: ['user'], // Load user relation to distinguish global vs personal
            order: { name: 'ASC' },
        });
    }

    async findOne(user: User, id: number): Promise<Category> {
        const category = await this.categoriesRepository.findOne({
            where: { id },
            relations: ['notes', 'user'],
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        // Check access: user owns it OR it's global
        if (category.user !== null && category.user.id !== user.id) {
            throw new ForbiddenException(
                'You do not have access to this category',
            );
        }

        return category;
    }

    async update(
        user: User,
        id: number,
        updateCategoryDto: UpdateCategoryDto,
    ): Promise<Category> {
        const category = await this.findOne(user, id);

        // Cannot update global categories
        if (category.user === null) {
            throw new ForbiddenException('Cannot modify global categories');
        }

        if (
            updateCategoryDto.name &&
            updateCategoryDto.name !== category.name
        ) {
            const existingCategory = await this.categoriesRepository.findOne({
                where: { name: updateCategoryDto.name, user: { id: user.id } },
            });

            if (existingCategory) {
                throw new ConflictException(
                    'You already have a category with this name',
                );
            }
        }

        Object.assign(category, updateCategoryDto);
        return await this.categoriesRepository.save(category);
    }

    async remove(user: User, id: number): Promise<void> {
        const category = await this.findOne(user, id);

        // Cannot delete global categories
        if (category.user === null) {
            throw new ForbiddenException('Cannot delete global categories');
        }

        await this.categoriesRepository.remove(category);
    }

    async findByNote(userId: number, noteId: number): Promise<Category[]> {
        return await this.categoriesRepository
            .createQueryBuilder('category')
            .innerJoin('category.notes', 'note')
            .where('note.id = :noteId', { noteId })
            .andWhere('note.userId = :userId', { userId })
            .getMany();
    }
}
