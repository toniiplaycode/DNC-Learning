import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInstructor } from '../../entities/UserInstructor';
import { Faculty } from '../../entities/Faculty';
import { UserInstructorsService } from './user-instructors.service';
import { UsersModule } from '../users/users.module';
import { UserInstructorsController } from './user-instructors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserInstructor, Faculty]), UsersModule],
  controllers: [UserInstructorsController],
  providers: [UserInstructorsService],
  exports: [UserInstructorsService],
})
export class UserInstructorsModule {}
