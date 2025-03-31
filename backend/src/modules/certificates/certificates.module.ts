import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { Certificate } from '../../entities/Certificate';
import { Enrollment } from '../../entities/Enrollment';
import { Course } from '../../entities/Course';
import { User } from '../../entities/User';

@Module({
  imports: [TypeOrmModule.forFeature([Certificate, Enrollment, Course, User])],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
