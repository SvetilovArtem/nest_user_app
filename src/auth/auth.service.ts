import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RedisService } from 'src/redis/redis.service';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
        private readonly redis: RedisService,
        private readonly mailer: MailerService
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
                avatarUrl: registerUserDto.avatarUrl ?? null
            }
        })

        await this.prisma.userInfo.create({
            data: {
              bio: registerUserDto.bio,
              userId: user.id,
            },
        })

        await this.prisma.userSettings.create({
            data: {
                is2faEnabled: registerUserDto.is2faEnabled ?? false,
                otpChannel: 'EMAIL',
                userId: user.id
            }
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

        const payload = { sub: user.id, email: user.email }
        const accessToken = await this.jwt.signAsync(payload)

        
        if (user && isPasswordValid && accessToken) {
            const otpCode = await this.generateOtp(user.email)
            const oc = await this.getOtpChannel(user.id) 

            if(oc.otpChannel) {
                this.sendOtpToChannel(oc.otpChannel, user.email, otpCode)
            }
        }

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

    async generateOtp(email: string) {
        const existingValue = await this.redis.get(`otp:${ email }`)
        if(existingValue) {
            throw new ConflictException('OTP уже отправлен. Подождите перед повторной отправкой.')
        }

        const otpCode = Math.floor(10000 + Math.random() * 90000).toString()
        await this.redis.set(`otp:${ email }`, otpCode, 300) // TTL 5 минут
        return otpCode
    }

    async getOtpChannel(userId: string) {
        const existingUser = await this.prisma.user.findUnique({ where: { id: userId } })
        if(!existingUser) throw new NotFoundException("Пользователь не найден!")
        
        const userSettings = await this.prisma.userSettings.findUnique({ where: { userId: existingUser.id } })
        return {
            is2faEnabled: userSettings?.is2faEnabled,
            otpChannel: userSettings?.otpChannel
        }
    }

    async sendOtpToChannel(otpChannel: string, emailTo: string, otpCode: string) {
        if(otpChannel == 'EMAIL') {
            this.mailer.sendOtp(emailTo, otpCode)
        } else {
            throw new NotFoundException("OTP-код может быть отправлен только на Email!")
        }
    }

}
