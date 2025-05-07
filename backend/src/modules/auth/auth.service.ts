import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterStudentDto } from './dto/register-student.dto';
import { User, UserRole, UserStatus } from '../../entities/User';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserStudent } from '../../entities/UserStudent';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserStudent)
    private userStudentRepository: Repository<UserStudent>,
    private dataSource: DataSource,
  ) {}

  // dùng để tạo token cho người dùng đã đăng nhập
  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN, // thời gian sống của refresh token
    });
    await this.userService.updateRefreshToken(user.id, refreshToken);
    const userData = await this.userService.findByEmail(user.email);
    if (!userData) {
      throw new UnauthorizedException('User not found');
    }
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: refreshToken,
      user: userData,
    };
  }

  async verifyRefreshToken(refreshToken: string) {
    try {
      const decoded = await this.jwtService.decode(refreshToken);
      if (decoded) {
        const user = await this.userService.verifyRefreshToken(
          refreshToken,
          decoded.sub,
        );
        return user;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async registerStudent(registerDto: RegisterStudentDto): Promise<any> {
    // Kiểm tra xem username hoặc email đã tồn tại chưa
    const existingUser = await this.userRepository.findOne({
      where: [{ email: registerDto.email }],
    });

    if (existingUser) {
      if (existingUser.email === registerDto.email) {
        throw new ConflictException('Email đã tồn tại');
      }
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Sử dụng transaction để đảm bảo tính nhất quán dữ liệu
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tạo bản ghi trong bảng User
      const newUser = new User();
      newUser.username = registerDto.username;
      newUser.email = registerDto.email;
      newUser.password = hashedPassword;
      newUser.role = UserRole.STUDENT;
      newUser.status = UserStatus.ACTIVE;

      const savedUser = await queryRunner.manager.save(newUser);

      // Tạo bản ghi trong bảng UserStudent
      const newUserStudent = new UserStudent();
      newUserStudent.userId = savedUser.id;
      newUserStudent.fullName = registerDto.fullName;

      await queryRunner.manager.save(newUserStudent);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Tạo JWT token
      const payload = {
        sub: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role,
      };

      const userData = await this.userService.findByEmail(savedUser.email);

      return {
        accessToken: this.jwtService.sign(payload),
        user: userData,
      };
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Đăng ký thất bại: ' + error.message);
    } finally {
      // Giải phóng queryRunner
      await queryRunner.release();
    }
  }

  /**
   * Đăng nhập/đăng ký user bằng Google
   */
  async loginWithGoogle(googleUser: any) {
    // Tìm user theo email
    let user = await this.userService.findByEmail(googleUser.email);
    if (!user) {
      // Nếu chưa có, tạo user mới
      user = this.userRepository.create({
        email: googleUser.email,
        username: googleUser.email.split('@')[0],
        password: '', // Không cần mật khẩu cho social login
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        avatarUrl: googleUser.picture,
        socialLoginProvider: 'google',
        socialLoginId: googleUser.accessToken, // Hoặc googleUser.id nếu có
      });
      user = await this.userRepository.save(user);
    }
    console.log(user);
    // Tạo JWT token
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }
}
