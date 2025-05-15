import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionAttendance } from '../../entities/SessionAttendance';
import { SessionAttendancesService } from './session-attendances.service';
import { TeachingSchedule } from '../../entities/TeachingSchedule';
import { UserStudentAcademic } from '../../entities/UserStudentAcademic';
import { SessionAttendancesController } from './session-attendances.controller';
import { User } from 'src/entities/User';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SessionAttendance,
      TeachingSchedule,
      UserStudentAcademic,
      User,
    ]),
  ],
  providers: [SessionAttendancesService],
  controllers: [SessionAttendancesController],
  exports: [SessionAttendancesService],
})
export class SessionAttendancesModule {}
