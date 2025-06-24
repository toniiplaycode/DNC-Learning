import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RegisterStudentDto } from './dto/register-student.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() userData: any) {
    return this.usersService.create(userData);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Post('refresh-token')
  async refreshToken(@Body() { refreshToken }: { refreshToken: string }) {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    const user = await this.authService.verifyRefreshToken(refreshToken);
    if (user) {
      return this.authService.login(user);
    }
    throw new UnauthorizedException('Invalid refresh token');
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);
    return user;
  }

  @Post('register/student')
  @HttpCode(HttpStatus.CREATED)
  async registerStudent(@Body() registerDto: RegisterStudentDto) {
    return this.authService.registerStudent(registerDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Redirect tới Google
  }

  @Get('oAuth')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const result = await this.authService.loginWithGoogle(req.user);
    // Redirect về FE, truyền token qua query
    return res.redirect(
      `${process.env.JAVASCRIPT_ORIGINS}?token=${result.token}`,
    );
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() { email }: { email: string }) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body()
    {
      emailHash,
      resetCode,
      password,
    }: {
      emailHash: string;
      resetCode: string;
      password: string;
    },
  ) {
    if (!emailHash || !resetCode || !password) {
      throw new BadRequestException(
        'Email hash, reset code and password are required',
      );
    }
    if (password.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long',
      );
    }
    return this.authService.resetPassword(emailHash, resetCode, password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('set-null-last-login/:userId')
  async setNullLastLogin(@Param('userId') userId: number) {
    console.log('userId', userId);
    return this.authService.setNullLastLogin(userId);
  }
}
