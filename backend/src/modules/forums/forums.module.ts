import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumsController } from './forums.controller';
import { ForumsService } from './forums.service';
import { Forum } from '../../entities/Forum';
import { ForumReply } from '../../entities/ForumReply';
import { ForumLike } from '../../entities/ForumLike';

@Module({
  imports: [TypeOrmModule.forFeature([Forum, ForumReply, ForumLike])],
  controllers: [ForumsController],
  providers: [ForumsService],
  exports: [ForumsService],
})
export class ForumsModule {}
