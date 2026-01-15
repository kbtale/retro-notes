import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { User } from '@/users/entities/user.entity';
import { Category } from './entities/category.entity';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Post()
    create(
        @GetUser() user: User,
        @Body() createCategoryDto: CreateCategoryDto,
    ): Promise<Category> {
        return this.categoriesService.create(user, createCategoryDto);
    }

    @Get()
    findAll(@GetUser() user: User): Promise<Category[]> {
        return this.categoriesService.findAllForUser(user);
    }

    @Get(':id')
    findOne(
        @GetUser() user: User,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<Category> {
        return this.categoriesService.findOne(user, id);
    }

    @Patch(':id')
    update(
        @GetUser() user: User,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ): Promise<Category> {
        return this.categoriesService.update(user, id, updateCategoryDto);
    }

    @Delete(':id')
    remove(
        @GetUser() user: User,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        return this.categoriesService.remove(user, id);
    }
}
