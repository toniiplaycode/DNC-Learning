import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  // dùng để tạo token cho người dùng đã đăng nhập
  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN, // thời gian sống của refresh token
    });
    await this.userService.updateRefreshToken(user.id, refreshToken);
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
    };
  }

  async verifyRefreshToken(refreshToken: string) {
    const decoded = await this.jwtService.decode(refreshToken);
    console.log(decoded);
    if (decoded) {
      const user = this.userService.verifyRefreshToken(
        refreshToken,
        decoded.sub,
      );
      if (user) {
        return user;
      }
    }
    return false;
  }
}
