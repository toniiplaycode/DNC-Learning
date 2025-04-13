import { Exclude, Expose, Type } from 'class-transformer';

class ClassInfo {
  id: number;
  classCode: string;
  className: string;
  semester: string;
}

class InstructorInfo {
  id: number;
  fullName: string;
  professionalTitle?: string;
  specialization?: string;
}

@Exclude()
export class ClassInstructorResponseDto {
  @Expose()
  id: number;

  @Expose()
  classId: number;

  @Expose()
  instructorId: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => ClassInfo)
  academicClass?: ClassInfo;

  @Expose()
  @Type(() => InstructorInfo)
  instructor?: InstructorInfo;
}
