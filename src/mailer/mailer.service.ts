import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'

export class MailerService {
    private readonly transporter: nodemailer.Transporter

    constructor(private readonly config: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: this.config.get('SMTP_USER'),
                pass: this.config.get('SMTP_PASS')
            }
        })
    }

    async sendOtp(email: string, otpCode: string): Promise<void> {
        await this.transporter.sendMail({
            from: `<${ this.config.get('SMTP_USER') }>`,
            to: email,
            subject: 'Ваш OTP-код',
            text: `Ваш код подтверждения: ${otpCode}`
        })
    }
}