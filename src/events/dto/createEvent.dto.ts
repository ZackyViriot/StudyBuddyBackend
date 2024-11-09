import { IsString, IsDate, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    start: Date;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    end: Date;

    @IsString()
    @IsOptional()
    color?: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsString()
    @IsNotEmpty()
    userId: string;
}