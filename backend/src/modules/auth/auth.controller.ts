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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { User } from '../../entities/User';
import { RegisterStudentDto } from './dto/register-student.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() userData: any) {
    return this.userService.create(userData);
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
  profile(@Request() req: any) {
    return req.user;
  }

  @Post('register/student')
  @HttpCode(HttpStatus.CREATED)
  async registerStudent(@Body() registerDto: RegisterStudentDto) {
    return this.authService.registerStudent(registerDto);
  }
}
