import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Note } from '../../notes/entities/note.entity';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @ManyToMany(() => Note, (note) => note.categories)
    notes: Note[];
}
