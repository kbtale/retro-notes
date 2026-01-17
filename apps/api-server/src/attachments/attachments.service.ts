import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Attachment } from './entities/attachment.entity';
import { Note } from '../notes/entities/note.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AttachmentsService {
    constructor(
        @InjectRepository(Attachment)
        private attachmentRepository: Repository<Attachment>,
        @InjectRepository(Note)
        private noteRepository: Repository<Note>,
    ) {}

    async create(
        file: Express.Multer.File,
        noteId: number,
        user: User,
    ): Promise<Attachment> {
        // Verify note exists and belongs to user
        const note = await this.noteRepository.findOne({
            where: { id: noteId, user: { id: user.id } },
        });

        if (!note) {
            throw new NotFoundException('Note not found or access denied');
        }

        const attachment = this.attachmentRepository.create({
            filename: file.originalname,
            storagePath: file.path,
            mimeType: file.mimetype,
            size: file.size,
            note,
        });

        return this.attachmentRepository.save(attachment);
    }

    async findAllByNote(noteId: number, user: User): Promise<Attachment[]> {
        // Verify note belongs to user
        const note = await this.noteRepository.findOne({
            where: { id: noteId, user: { id: user.id } },
        });

        if (!note) {
            throw new NotFoundException('Note not found or access denied');
        }

        return this.attachmentRepository.find({
            where: { note: { id: noteId } },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number, user: User): Promise<Attachment> {
        const attachment = await this.attachmentRepository.findOne({
            where: { id },
            relations: ['note', 'note.user'],
        });

        if (!attachment) {
            throw new NotFoundException('Attachment not found');
        }

        if (attachment.note.user.id !== user.id) {
            throw new ForbiddenException('Access denied');
        }

        return attachment;
    }

    async remove(id: number, user: User): Promise<void> {
        const attachment = await this.findOne(id, user);

        // Delete file from disk
        try {
            if (fs.existsSync(attachment.storagePath)) {
                fs.unlinkSync(attachment.storagePath);
            }
        } catch (error) {
            console.error('Failed to delete file:', error);
        }

        await this.attachmentRepository.remove(attachment);
    }

    async getFilePath(id: number, user: User): Promise<string> {
        const attachment = await this.findOne(id, user);
        
        if (!fs.existsSync(attachment.storagePath)) {
            throw new NotFoundException('File not found on disk');
        }

        return attachment.storagePath;
    }
}
