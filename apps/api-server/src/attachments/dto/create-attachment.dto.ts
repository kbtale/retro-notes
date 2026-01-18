import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateAttachmentDto {
    @IsString()
    @IsNotEmpty()
    filename: string;

    @IsString()
    @IsNotEmpty()
    mimeType: string;

    @IsNumber()
    size: number;

    @IsNumber()
    noteId: number;
}
