import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterStudentDto } from './dto/register-student.dto';
import { User, UserRole, UserStatus } from '../../entities/User';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserStudent } from '../../entities/UserStudent';
import * as bcrypt from 'bcrypt';
import { EmailService } from './services/email.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

// Note: Cần cài đặt @nestjs-modules/mailer và nodemailer:
// npm install @nestjs-modules/mailer nodemailer
// npm install -D @types/nodemailer

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  // Lưu trữ tạm thời mã reset và thời gian hết hạn
  private resetCodes = new Map<string, { code: string; expiresAt: Date }>();

  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserStudent)
    private userStudentRepository: Repository<UserStudent>,
    private dataSource: DataSource,
    private emailService: EmailService,
    private configService: ConfigService,
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
      // Nếu chưa có, tạo user mới và userStudent trong transaction
      user = await this.userRepository.manager.transaction(
        async (transactionalEntityManager) => {
          // 1. Create user
          const newUser = this.userRepository.create({
            email: googleUser.email,
            username: googleUser.email.split('@')[0],
            password: '', // Không cần mật khẩu cho social login
            role: UserRole.STUDENT,
            status: UserStatus.ACTIVE,
            avatarUrl: googleUser.picture,
            socialLoginProvider: 'google',
            socialLoginId: googleUser.accessToken,
          });
          const savedUser = await transactionalEntityManager.save(
            User,
            newUser,
          );

          // 2. Create userStudent
          const userStudentData: Partial<UserStudent> = {
            userId: savedUser.id,
            fullName: googleUser.name || googleUser.email.split('@')[0],
            dateOfBirth: undefined,
            gender: undefined,
            educationLevel: undefined,
            occupation: undefined,
            bio: undefined,
            interests: undefined,
            address: undefined,
            city: undefined,
            country: undefined,
            learningGoals: undefined,
            preferredLanguage: undefined,
            notificationPreferences: undefined,
            totalCoursesEnrolled: 0,
            totalCoursesCompleted: 0,
            achievementPoints: 0,
          };
          const userStudent =
            this.userStudentRepository.create(userStudentData);
          await transactionalEntityManager.save(UserStudent, userStudent);

          return savedUser;
        },
      );
    }
    // Tạo JWT token
    const payload = { sub: user.id, email: user.email };
    return {
      token: this.jwtService.sign(payload),
      user,
    };
  }

  async forgotPassword(email: string) {
    // Tìm user theo email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Không trả về lỗi để tránh email enumeration attack
      return {
        message:
          'If your email is registered, you will receive a password reset code',
      };
    }

    // Tạo mã reset ngẫu nhiên 6 chữ số
    const resetCode = crypto.randomInt(100000, 999999).toString();
    // Mã hóa email để dùng làm key
    const emailHash = crypto.createHash('sha256').update(email).digest('hex');

    // Lưu mã reset với thời hạn 15 phút
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    this.resetCodes.set(emailHash, { code: resetCode, expiresAt });

    // Lấy FRONTEND_URL từ ConfigService
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      this.logger.error(
        'FRONTEND_URL is not configured in environment variables',
      );
      throw new BadRequestException('Server configuration error');
    }

    // Tạo reset URL với mã reset
    const resetUrl = `${frontendUrl}/reset-password?code=${resetCode}&email=${emailHash}`;
    this.logger.log(`Generated reset code for ${email}`);

    try {
      // Lấy thông tin chi tiết user để có tên đầy đủ
      const userDetails = await this.userRepository.findOne({
        where: { id: user.id },
        relations: ['userStudent', 'userInstructor'],
      });

      const userName =
        userDetails?.userStudent?.fullName ||
        userDetails?.userInstructor?.fullName ||
        user.username;

      // Sử dụng EmailService để gửi email với mã reset
      await this.emailService.sendResetPasswordEmail(
        user.email,
        userName,
        resetUrl,
        resetCode, // Thêm mã reset vào email
      );

      return {
        message:
          'If your email is registered, you will receive a password reset code',
      };
    } catch (error) {
      this.logger.error(
        `Failed to send reset password email to ${email}:`,
        error,
      );
      throw new BadRequestException('Failed to send reset password email');
    }
  }

  async resetPassword(
    emailHash: string,
    resetCode: string,
    newPassword: string,
  ) {
    try {
      // Kiểm tra mã reset
      const resetData = this.resetCodes.get(emailHash);
      if (!resetData) {
        throw new BadRequestException('Invalid or expired reset code');
      }

      // Kiểm tra thời hạn
      if (new Date() > resetData.expiresAt) {
        this.resetCodes.delete(emailHash);
        throw new BadRequestException('Reset code has expired');
      }

      // Kiểm tra mã reset
      if (resetCode !== resetData.code) {
        throw new BadRequestException('Invalid reset code');
      }

      // Tìm user theo email hash
      const users = await this.userRepository.find();
      const user = users.find(
        (u) =>
          crypto.createHash('sha256').update(u.email).digest('hex') ===
          emailHash,
      );

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Hash mật khẩu mới
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Cập nhật mật khẩu
      await this.userRepository.update(user.id, {
        password: hashedPassword,
      });

      // Xóa mã reset đã sử dụng
      this.resetCodes.delete(emailHash);

      return { message: 'Password has been reset successfully' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to reset password');
    }
  }
}
