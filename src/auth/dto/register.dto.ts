import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
    @IsEmail()
    email: string

    @IsString()
    @MinLength(6)
    @MaxLength(100)
    password: string

    @IsString()
    @MinLength(1)
    @MaxLength(50)
    firstName: string

    @IsString()
    @MinLength(1)
    @MaxLength(50)
    lastName: string

    @IsOptional()
    @IsBoolean()
    is2faEnabled?: boolean

    @IsOptional()
    @IsString()
    @MaxLength(100)
    otpSecret?: string

    @IsOptional()
    @IsString()
    @MaxLength(255)
    avatarUrl?: string

    @IsString()
    @MinLength(30)
    @MaxLength(1500)
    bio: string
}