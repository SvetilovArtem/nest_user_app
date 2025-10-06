import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService
    ) {}

    register(registerUserDto: RegisterDto) {
        return 'Register a new user!'
    }
}
