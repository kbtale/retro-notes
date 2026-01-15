# API Server Implementation Plan

## 📋 Overview

This document outlines the implementation plan for improving the api-server codebase with better validation, type safety, and architectural decisions.

---

## 🔍 Design Decision Answers

### Question 2: Categories - Global vs User-Scoped

Since you want **both general (global) categories AND personalized (user-scoped) categories**, here are your options:

#### **Option A: Single Entity with `isGlobal` Flag**

```typescript
@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ default: false })
    isGlobal: boolean;  // true = shared, false = user-owned

    @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
    user: User | null;  // null for global categories

    // ... timestamps, notes relation
}
```

| Pros | Cons |
|------|------|
| ✅ Simple single table design | ❌ Nullable user relation (less clean) |
| ✅ Easy to query both types together | ❌ Unique constraint on `name` becomes complex (need composite unique on `name + user`) |
| ✅ Shared `notes` relationship works naturally | ❌ Business logic scattered across service |

---

#### **Option B: Separate Tables (GlobalCategory + UserCategory)**

```typescript
@Entity('global_categories')
export class GlobalCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;
}

@Entity('user_categories')
export class UserCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;
}
```

| Pros | Cons |
|------|------|
| ✅ Clean separation of concerns | ❌ Two entities to manage |
| ✅ No nullable relations | ❌ Notes need to reference both (polymorphic relation) |
| ✅ Easy unique constraints per table | ❌ More complex queries (UNION needed for combined views) |
| ✅ Clear permissions model | ❌ Duplication of similar code |

---

#### **Option C: Single Entity with Owner Discriminator (Recommended ⭐)**

```typescript
@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
    user: User | null;  // null = global category

    @ManyToMany(() => Note, (note) => note.categories)
    notes: Note[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

// Add composite unique constraint
@Unique(['name', 'user'])  // Allows same name for different users
```

**Query Logic:**
```typescript
// Get categories available to a user (their own + global)
async findAllForUser(user: User): Promise<Category[]> {
    return this.categoriesRepository.find({
        where: [
            { user: { id: user.id } },  // User's own categories
            { user: IsNull() }           // Global categories
        ],
        order: { name: 'ASC' },
    });
}
```

| Pros | Cons |
|------|------|
| ✅ Single table, clean design | ❌ Nullable user (minor) |
| ✅ Composite unique allows same names across users | ❌ Need to handle IsNull() in queries |
| ✅ Easy permission checks (`category.user === null` or `category.user.id === currentUser.id`) | |
| ✅ Global categories seeded once, user categories created per-user | |
| ✅ Notes relationship unchanged | |

**🏆 My Recommendation: Option C** - It's the cleanest balance of simplicity and functionality.

---

### Question 3: `class-transformer` Pros/Cons

**What is `class-transformer`?**
A library that transforms plain objects to class instances and vice versa, working alongside `class-validator`.

#### **Pros:**
| Benefit | Example |
|---------|---------|
| **Type Coercion** | Convert `"123"` (string from URL) to `123` (number) automatically |
| **Exclusion** | Hide sensitive fields like `passwordHash` from responses using `@Exclude()` |
| **Transformation** | Transform date strings to Date objects, trim strings, etc. |
| **Nested Validation** | Properly validate nested DTOs with `@Type(() => NestedDto)` |
| **Response Serialization** | Control exactly what gets sent in API responses |

#### **Cons:**
| Downside | Explanation |
|----------|-------------|
| Additional dependency | One more package to maintain |
| Learning curve | Decorators like `@Expose()`, `@Type()`, `@Transform()` add complexity |
| Performance overhead | Transformation has a small runtime cost |
| Can mask errors | Auto-coercion might hide bugs (e.g., wrong type sent by client) |

#### **What it affects:**
```typescript
// Without class-transformer
@Query('categoryId') categoryId?: string  // Always string from URL
// You manually call: Number(categoryId)

// With class-transformer + @Transform
@Query('categoryId') 
@Transform(({ value }) => parseInt(value))
categoryId?: number  // Automatically converted

// Response serialization
class User {
    @Exclude()
    passwordHash: string;  // Never sent in responses
}
```

**🏆 Recommendation:** Add it. The benefits (especially `@Exclude()` for hiding passwords) outweigh the minimal overhead.

---

### Question 6: ConfigService Benefits

| Benefit | Explanation |
|---------|-------------|
| **Type Safety** | `configService.get<string>('JWT_SECRET')` vs `process.env.JWT_SECRET` |
| **Validation** | Can validate required env vars at startup using Joi/class-validator |
| **Centralization** | All config in one place, can expand namespaces |
| **Testability** | Easy to mock in tests (`{ provide: ConfigService, useValue: mockConfig }`) |
| **DI Integration** | Works with NestJS dependency injection |
| **Default Values** | `configService.get('PORT', 3000)` |
| **getOrThrow** | `configService.getOrThrow('JWT_SECRET')` fails fast if missing |

---

### Question: `noImplicitAny: true` Cons

| Downside | Mitigation |
|----------|------------|
| Initial effort to fix all implicit `any` types | One-time cost, improves maintainability |
| Some third-party libs may have poor types | Use `@ts-ignore` sparingly or add custom declarations |
| Slightly more verbose code | Better than runtime type errors |
| May break existing code | Fix incrementally |

**🏆 Recommendation:** The pros far outweigh the cons. Catches bugs at compile time.

---

## 📝 Implementation Tasks

### Phase 1: Quick Wins (Validation & Types)

#### Task 1.1: Add Validation to LoginDto
**File:** `src/auth/dto/login.dto.ts`

```typescript
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password: string;
}
```

---

#### Task 1.2: Create RegisterDto
**File:** `src/auth/dto/register.dto.ts` (new file)

```typescript
import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(20)
    @Matches(/^[a-zA-Z0-9_]+$/, { 
        message: 'Username can only contain letters, numbers, and underscores' 
    })
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(100)
    password: string;
}
```

---

#### Task 1.3: Add Register Endpoint
**File:** `src/auth/auth.controller.ts`

```typescript
@Post('register')
async register(@Body() registerDto: RegisterDto): Promise<LoginResponse> {
    return this.authService.register(registerDto);
}
```

**File:** `src/auth/auth.service.ts`

```typescript
async register(registerDto: RegisterDto): Promise<LoginResponse> {
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

    const payload: JwtPayload = { username: savedUser.username, sub: savedUser.id };
    return {
        access_token: this.jwtService.sign(payload),
    };
}
```

---

#### Task 1.4: Add ParseIntPipe to Controllers
**Files:** `notes.controller.ts`, `categories.controller.ts`

**Before:**
```typescript
@Get(':id')
findOne(@GetUser() user: User, @Param('id') id: string) {
    return this.notesService.findOne(user, parseInt(id));
}
```

**After:**
```typescript
import { ParseIntPipe } from '@nestjs/common';

@Get(':id')
findOne(
    @GetUser() user: User, 
    @Param('id', ParseIntPipe) id: number
): Promise<Note> {
    return this.notesService.findOne(user, id);
}
```

---

#### Task 1.5: Add Return Types to All Controller Methods
**Example pattern:**
```typescript
@Post()
create(@GetUser() user: User, @Body() dto: CreateNoteDto): Promise<Note> { ... }

@Get()
findAll(@GetUser() user: User): Promise<Note[]> { ... }

@Delete(':id')
remove(@GetUser() user: User, @Param('id', ParseIntPipe) id: number): Promise<void> { ... }
```

---

### Phase 2: Configuration & Setup

#### Task 2.1: Add Global API Prefix
**File:** `src/main.ts`

```typescript
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    app.setGlobalPrefix('api');  // All routes now: /api/notes, /api/auth/login
    
    app.enableCors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true,
    });
    
    // ... rest of setup
}
```

---

#### Task 2.2: Fix E2E Test Import
**File:** `test/app.e2e-spec.ts`

```typescript
// Change this:
import { AppModule } from '../src/auth/auth.module';

// To this:
import { AppModule } from '../src/app.module';
```

---

#### Task 2.3: Set `noImplicitAny: true`
**File:** `tsconfig.json`

```json
{
    "compilerOptions": {
        "noImplicitAny": true,
        // ... other options
    }
}
```

Then fix any resulting type errors.

---

### Phase 3: Entity Improvements

#### Task 3.1: Add Timestamps to Category Entity
**File:** `src/categories/entities/category.entity.ts`

```typescript
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToMany,
    CreateDateColumn,
    UpdateDateColumn 
} from 'typeorm';
import { Note } from '../../notes/entities/note.entity';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @ManyToMany(() => Note, (note) => note.categories)
    notes: Note[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
```

---

#### Task 3.2: Add User Scoping to Categories (Option C)
**File:** `src/categories/entities/category.entity.ts`

```typescript
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToMany,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Unique
} from 'typeorm';
import { Note } from '../../notes/entities/note.entity';
import { User } from '../../users/entities/user.entity';

@Entity('categories')
@Unique(['name', 'user'])  // Same name allowed for different users
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
    user: User | null;  // null = global category

    @ManyToMany(() => Note, (note) => note.categories)
    notes: Note[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
```

**File:** `src/categories/categories.service.ts` - Update queries

```typescript
import { IsNull } from 'typeorm';

async findAllForUser(user: User): Promise<Category[]> {
    return this.categoriesRepository.find({
        where: [
            { user: { id: user.id } },
            { user: IsNull() }
        ],
        order: { name: 'ASC' },
    });
}

async create(user: User, createCategoryDto: CreateCategoryDto): Promise<Category> {
    // User categories are scoped to the user
    const existingCategory = await this.categoriesRepository.findOne({
        where: { name: createCategoryDto.name, user: { id: user.id } },
    });

    if (existingCategory) {
        throw new ConflictException('You already have a category with this name');
    }

    const category = this.categoriesRepository.create({
        ...createCategoryDto,
        user,  // Associate with user (not global)
    });
    return await this.categoriesRepository.save(category);
}
```

---

### Phase 4: Install Dependencies

```bash
npm install class-transformer
```

Update `main.ts` to enable transformation:
```typescript
app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: {
        enableImplicitConversion: true,  // Enables automatic type conversion
    },
}));
```

---

## 📋 Implementation Checklist

| # | Task | Priority | File(s) |
|---|------|----------|---------|
| 1 | Add validation to LoginDto | High | `auth/dto/login.dto.ts` |
| 2 | Create RegisterDto | High | `auth/dto/register.dto.ts` (new) |
| 3 | Add register endpoint | High | `auth.controller.ts`, `auth.service.ts` |
| 4 | Use ParseIntPipe | Medium | `notes.controller.ts`, `categories.controller.ts` |
| 5 | Add return types to controllers | Medium | All controllers |
| 6 | Add global API prefix | Medium | `main.ts` |
| 7 | Fix E2E test import | High | `test/app.e2e-spec.ts` |
| 8 | Set noImplicitAny: true | Medium | `tsconfig.json` |
| 9 | Add timestamps to Category | Low | `categories/entities/category.entity.ts` |
| 10 | Add user scoping to Categories | Medium | `category.entity.ts`, `categories.service.ts`, `categories.controller.ts` |
| 11 | Install class-transformer | Low | `package.json`, `main.ts` |

---

## ⚠️ Notes

- After adding timestamps to Category, you may need to run a migration or let synchronize add the columns
- The E2E test fix is critical - tests are currently broken
- After enabling `noImplicitAny`, expect some type errors to fix
- The `api` prefix will change all your frontend API calls from `/notes` to `/api/notes`

---

Ready to implement? Let me know and I'll start with the changes!
