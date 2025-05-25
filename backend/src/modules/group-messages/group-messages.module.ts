import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMessage } from '../../entities/GroupMessage';
import { GroupMessagesGateway } from './group-messages.gateway';
import { User } from '../../entities/User';
import { AcademicClass } from '../../entities/AcademicClass';
import { GroupMessagesController } from './group-messages.controller';
import { GroupMessagesService } from './group-messages.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupMessage, User, AcademicClass]),
    UsersModule,
  ],
  providers: [GroupMessagesService, GroupMessagesGateway],
  controllers: [GroupMessagesController],
  exports: [GroupMessagesService],
})
export class GroupMessagesModule {}
