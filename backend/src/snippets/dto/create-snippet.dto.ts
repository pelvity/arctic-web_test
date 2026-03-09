import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateSnippetDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    content: string;

    @IsArray()
    @IsString({ each: true })
    tags: string[];

    @IsEnum(['link', 'note', 'command'])
    type: string;
}
