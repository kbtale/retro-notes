import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    ManyToMany,
    OneToMany,
    JoinTable,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Attachment } from '../../attachments/entities/attachment.entity';

@Entity('notes')
export class Note {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column('text')
    content: string;

    @Column({ default: false })
    isArchived: boolean;

    @ManyToOne(() => User, (user) => user.notes, { onDelete: 'CASCADE' })
    user: User;

    @ManyToMany(() => Category, (category) => category.notes)
    @JoinTable()
    categories: Category[];

    @OneToMany(() => Attachment, (attachment) => attachment.note)
    attachments: Attachment[];

    @Column({ default: false })
    isPinned: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
