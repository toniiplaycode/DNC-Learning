import { PartialType } from '@nestjs/mapped-types';
import { CreateForumReplyDto } from './create-forum-reply.dto';

export class UpdateForumReplyDto extends PartialType(CreateForumReplyDto) {}
