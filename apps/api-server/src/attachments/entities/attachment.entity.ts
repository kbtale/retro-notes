import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { Note } from '../../notes/entities/note.entity';

@Entity('attachments')
export class Attachment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    filename: string; // Original filename

    @Column()
    storagePath: string; // Server path to stored file

    @Column()
    mimeType: string; // e.g., 'image/png', 'application/pdf'

    @Column()
    size: number; // File size in bytes

    @ManyToOne(() => Note, (note) => note.attachments, { onDelete: 'CASCADE' })
    note: Note;

    @CreateDateColumn()
    createdAt: Date;
}
