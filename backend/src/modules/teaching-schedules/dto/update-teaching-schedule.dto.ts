import { PartialType } from '@nestjs/mapped-types';
import { CreateTeachingScheduleDto } from './create-teaching-schedule.dto';

export class UpdateTeachingScheduleDto extends PartialType(
  CreateTeachingScheduleDto,
) {}
