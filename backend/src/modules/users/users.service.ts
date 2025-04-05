import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: {
        userStudent: true,
        userStudentAcademic: true,
        userInstructor: true,
      },
    });
  }
  async create(userData: Partial<User>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = this.userRepository.create(userData);
    newUser.password = hashedPassword;
    return this.userRepository.save(newUser);
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: {
        userStudent: true,
        userStudentAcademic: true,
        userInstructor: true,
      },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: {
        userStudent: true,
        userStudentAcademic: true,
        userInstructor: true,
      },
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    throw new UnauthorizedException('password or email is incorrect !');
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (user) {
      user.refreshToken = refreshToken;
      await this.userRepository.save(user);
    }
    return null;
  }

  async verifyRefreshToken(refreshToken: string, userId?: number) {
    const user = await this.userRepository.findOneBy({ refreshToken });
    if (user) {
      return user;
    }
    return false;
  }
}
