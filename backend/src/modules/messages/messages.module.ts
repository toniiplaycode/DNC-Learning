import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { Message } from 'src/entities/Message';
import { MessagesController } from './messages.controller';
import { User } from 'src/entities/User';
import { UserInstructor } from 'src/entities/UserInstructor';
import { UserStudent } from 'src/entities/UserStudent';
import { UserStudentAcademic } from 'src/entities/UserStudentAcademic';
import { WsJwtAuthGuard } from 'src/guards/ws-jwt.guard';

@Module({
  controllers: [MessagesController],
  imports: [
    TypeOrmModule.forFeature([
      Message,
      User,
      UserStudent,
      UserInstructor,
      UserStudentAcademic,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  providers: [MessagesService, MessagesGateway, WsJwtAuthGuard],
  exports: [MessagesService],
})
export class MessagesModule {}
