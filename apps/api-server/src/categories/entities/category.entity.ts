import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';
import { Note } from '../../notes/entities/note.entity';
import { User } from '../../users/entities/user.entity';

@Entity('categories')
@Unique(['name', 'user']) // Same name allowed for different users
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
    user: User | null; // null = global category

    @ManyToMany(() => Note, (note) => note.categories)
    notes: Note[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

