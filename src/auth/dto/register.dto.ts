import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
    @IsEmail()
    email: string

    @IsString()
    @MinLength(6)
    @MaxLength(100)
    @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,100}$/, 
        {
          message:
            'Пароль должен содержать хотя бы одну заглавную букву, одну цифру, один специальный символ и состоять только из латинских букв и допустимых символов',
        }
    )        
    password: string

    @IsString({ message: 'Имя должно быть строкой' })
    @MinLength(1, { message: 'Имя обязательно для заполнения' })
    @MaxLength(50, { message: 'Имя слишком длинное' })
    firstName: string;

    @IsString({ message: 'Фамилия должна быть строкой' })
    @MinLength(1, { message: 'Фамилия обязательна для заполнения' })
    @MaxLength(50, { message: 'Фамилия слишком длинная' })
    lastName: string;

    @IsOptional()
    @IsBoolean({ message: 'is2faEnabled должен быть булевым значением' })
    is2faEnabled?: boolean;

    @IsOptional()
    @IsString({ message: 'otpSecret должен быть строкой' })
    @MaxLength(100, { message: 'otpSecret слишком длинный' })
    otpSecret?: string;

    @IsOptional()
    @IsString({ message: 'avatarUrl должен быть строкой' })
    @MaxLength(255, { message: 'avatarUrl слишком длинный' })
    avatarUrl?: string;

    @IsString({ message: 'Биография должна быть строкой' })
    @MinLength(30, { message: 'Биография должна содержать минимум 30 символов' })
    @MaxLength(1500, { message: 'Биография слишком длинная' })
    bio: string;
}