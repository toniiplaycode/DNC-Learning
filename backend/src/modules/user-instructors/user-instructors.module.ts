import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInstructor } from '../../entities/UserInstructor';
import { UserInstructorsService } from './user-instructors.service';
import { UsersModule } from '../users/users.module';
import { UserInstructorsController } from './user-instructors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserInstructor]), UsersModule],
  controllers: [UserInstructorsController],
  providers: [UserInstructorsService],
  exports: [UserInstructorsService],
})
export class UserInstructorsModule {}
