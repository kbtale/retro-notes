import {
    IsString,
    IsOptional,
    IsBoolean,
    IsArray,
    IsNumber,
} from 'class-validator';

export class CreateNoteDto {
    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsOptional()
    @IsBoolean()
    isArchived?: boolean;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    categoryIds?: number[];
}
