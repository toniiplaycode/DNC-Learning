import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from 'src/passport/local.strategy';
import { JwtStrategy } from 'src/passport/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    PassportModule, // module cung cấp các phương thức xác thực token
    JwtModule.register({
      secret: process.env.JWT_SECRET, // khóa bí mật để mã hóa và giải mã token
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }, // thời gian hạn sử dụng token
    }),
  ],
})
export class AuthModule {}
