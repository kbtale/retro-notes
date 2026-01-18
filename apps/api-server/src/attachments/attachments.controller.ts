import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    ParseIntPipe,
    Res,
    StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { AttachmentsService } from './attachments.service';
import { Attachment } from './entities/attachment.entity';

// Configure multer storage
const storage = diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

@Controller('attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
    constructor(private readonly attachmentsService: AttachmentsService) {}

    @Post('note/:noteId')
    @UseInterceptors(FileInterceptor('file', { storage }))
    async upload(
        @Param('noteId', ParseIntPipe) noteId: number,
        @UploadedFile() file: Express.Multer.File,
        @GetUser() user: User,
    ): Promise<Attachment> {
        return this.attachmentsService.create(file, noteId, user);
    }

    @Get('note/:noteId')
    async findAllByNote(
        @Param('noteId', ParseIntPipe) noteId: number,
        @GetUser() user: User,
    ): Promise<Attachment[]> {
        return this.attachmentsService.findAllByNote(noteId, user);
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User,
    ): Promise<Attachment> {
        return this.attachmentsService.findOne(id, user);
    }

    @Get(':id/download')
    async download(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User,
        @Res({ passthrough: true }) res: Response,
    ): Promise<StreamableFile> {
        const attachment = await this.attachmentsService.findOne(id, user);
        const filePath = await this.attachmentsService.getFilePath(id, user);
        
        const file = fs.createReadStream(filePath);
        res.set({
            'Content-Type': attachment.mimeType,
            'Content-Disposition': `attachment; filename="${attachment.filename}"`,
        });
        
        return new StreamableFile(file);
    }

    @Delete(':id')
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User,
    ): Promise<void> {
        return this.attachmentsService.remove(id, user);
    }
}
