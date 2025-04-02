import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from '../../entities/Document';
import { CourseSection } from '../../entities/CourseSection';
import { Course } from '../../entities/Course';
import { UserInstructor } from '../../entities/UserInstructor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, CourseSection, Course, UserInstructor]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
