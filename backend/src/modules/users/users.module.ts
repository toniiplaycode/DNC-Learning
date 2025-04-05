import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/User';
import { UserStudent } from 'src/entities/UserStudent';
import { UserInstructor } from 'src/entities/UserInstructor';
import { UserStudentAcademic } from '../../entities/UserStudentAcademic';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserStudent,
      UserInstructor,
      UserStudentAcademic,
    ]),
  ],
  exports: [UsersService],
})
export class UsersModule {}
