import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from '../../entities/Certificate';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { User } from '../../entities/User';
import { Course } from '../../entities/Course';
import { Enrollment } from '../../entities/Enrollment';

@Module({
  imports: [TypeOrmModule.forFeature([Certificate, User, Course, Enrollment])],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
