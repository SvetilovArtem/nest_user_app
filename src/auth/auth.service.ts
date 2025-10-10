import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt'
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService
    ) {}

    async register(registerUserDto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerUserDto.email }
        })

        if (existingUser) {
            throw new ConflictException('Пользователь с таким email уже существует!')
        }

        const hashedPassword = await bcrypt.hash(registerUserDto.password, 10)

        const user = await this.prisma.user.create({
            data: {
                email: registerUserDto.email,
                password: hashedPassword,
                firstName: registerUserDto.firstName,
                lastName: registerUserDto.lastName,
                is2faEnabled: registerUserDto.is2faEnabled ?? false,
                otpSecret: registerUserDto.otpSecret ?? null,
                avatarUrl: registerUserDto.avatarUrl ?? null
            }
        })

        await this.prisma.userInfo.create({
            data: {
              bio: registerUserDto.bio,
              userId: user.id,
            },
        })
        return {
            message: "Вы успешно зарегистрированы !",
            user
        }
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email }
        })

        if(!user) {
            throw new UnauthorizedException("Неверный email или пароль!")
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password)
        if(!isPasswordValid) {
            throw new UnauthorizedException("Неверный email или пароль!")
        }

        if (user && isPasswordValid) {

        }

        const payload = { sub: user.id, email: user.email }
        const accessToken = await this.jwt.signAsync(payload)

        return {
            accessToken,
            message: "Вы успешно авторизованы!",
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatarUrl
            }
        }
    }

    async generateOtpSecretCode(otpSecret: string) {
        
    }

}
