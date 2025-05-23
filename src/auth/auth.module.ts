import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TokenModule } from '../token/token.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [UserModule, TokenModule, MailModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
