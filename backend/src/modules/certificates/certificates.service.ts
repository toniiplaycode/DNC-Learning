import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate, CertificateStatus } from '../../entities/Certificate';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { v4 as uuidv4 } from 'uuid';
import { Enrollment, EnrollmentStatus } from '../../entities/Enrollment';
import { Course } from '../../entities/Course';
import { User } from '../../entities/User';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private certificatesRepository: Repository<Certificate>,
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(
    createCertificateDto: CreateCertificateDto,
  ): Promise<Certificate> {
    // Check if user and course exist
    const user = await this.usersRepository.findOne({
      where: { id: createCertificateDto.userId },
    });
    if (!user) {
      throw new NotFoundException(
        `User with ID ${createCertificateDto.userId} not found`,
      );
    }

    const course = await this.coursesRepository.findOne({
      where: { id: createCertificateDto.courseId },
    });
    if (!course) {
      throw new NotFoundException(
        `Course with ID ${createCertificateDto.courseId} not found`,
      );
    }

    // Check if a certificate already exists
    const existingCertificate = await this.certificatesRepository.findOne({
      where: {
        userId: createCertificateDto.userId,
        courseId: createCertificateDto.courseId,
      },
    });

    if (existingCertificate) {
      throw new ConflictException(
        `Certificate already exists for user ${createCertificateDto.userId} and course ${createCertificateDto.courseId}`,
      );
    }

    // Generate certificate number if not provided
    if (!createCertificateDto.certificateNumber) {
      createCertificateDto.certificateNumber = this.generateCertificateNumber(
        createCertificateDto.userId,
        createCertificateDto.courseId,
      );
    }

    // Create and save certificate
    const certificate =
      this.certificatesRepository.create(createCertificateDto);
    return this.certificatesRepository.save(certificate);
  }

  async findAll(status?: string): Promise<Certificate[]> {
    const query = this.certificatesRepository
      .createQueryBuilder('certificate')
      .leftJoinAndSelect('certificate.user', 'user')
      .leftJoinAndSelect('certificate.course', 'course');

    if (status) {
      query.where('certificate.status = :status', { status });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Certificate> {
    const certificate = await this.certificatesRepository.findOne({
      where: { id },
      relations: ['user', 'course'],
    });

    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }

    return certificate;
  }

  async findByUser(userId: number, status?: string): Promise<Certificate[]> {
    const query = this.certificatesRepository
      .createQueryBuilder('certificate')
      .leftJoinAndSelect('certificate.course', 'course')
      .where('certificate.userId = :userId', { userId });

    if (status) {
      query.andWhere('certificate.status = :status', { status });
    }

    return query.getMany();
  }

  async findByCourse(
    courseId: number,
    status?: string,
  ): Promise<Certificate[]> {
    const query = this.certificatesRepository
      .createQueryBuilder('certificate')
      .leftJoinAndSelect('certificate.user', 'user')
      .where('certificate.courseId = :courseId', { courseId });

    if (status) {
      query.andWhere('certificate.status = :status', { status });
    }

    return query.getMany();
  }

  async update(
    id: number,
    updateCertificateDto: UpdateCertificateDto,
  ): Promise<Certificate> {
    const certificate = await this.findOne(id);
    Object.assign(certificate, updateCertificateDto);
    return this.certificatesRepository.save(certificate);
  }

  async remove(id: number): Promise<void> {
    const certificate = await this.findOne(id);
    await this.certificatesRepository.remove(certificate);
  }

  async verifyCertificate(certificateNumber: string): Promise<any> {
    const certificate = await this.certificatesRepository.findOne({
      where: { certificateNumber },
      relations: ['user', 'course'],
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found or invalid');
    }

    // Check if certificate is valid
    if (certificate.status !== CertificateStatus.ACTIVE) {
      return {
        valid: false,
        status: certificate.status,
        message: `Certificate is ${certificate.status}`,
      };
    }

    // Check if certificate is expired
    if (
      certificate.expiryDate &&
      new Date(certificate.expiryDate) < new Date()
    ) {
      certificate.status = CertificateStatus.EXPIRED;
      await this.certificatesRepository.save(certificate);

      return {
        valid: false,
        status: CertificateStatus.EXPIRED,
        message: 'Certificate has expired',
      };
    }

    // Return verification result
    return {
      valid: true,
      certificate: {
        id: certificate.id,
        certificateNumber: certificate.certificateNumber,
        issueDate: certificate.issueDate,
        expiryDate: certificate.expiryDate,
        status: certificate.status,
        user: {
          id: certificate.user.id,
          fullName: certificate.user.username, // Assuming there's a fullName property
        },
        course: {
          id: certificate.course.id,
          title: certificate.course.title,
        },
      },
    };
  }

  async generateCertificate(enrollmentId: number): Promise<Certificate> {
    // Find the enrollment
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { id: enrollmentId },
      relations: ['user', 'course'],
    });

    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment with ID ${enrollmentId} not found`,
      );
    }

    // Check if enrollment is completed
    if (enrollment.status !== EnrollmentStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot generate certificate for an incomplete course',
      );
    }

    // Check if certificate already exists
    const existingCertificate = await this.certificatesRepository.findOne({
      where: {
        userId: enrollment.userId,
        courseId: enrollment.courseId,
      },
    });

    if (existingCertificate) {
      throw new ConflictException(
        'Certificate already exists for this enrollment',
      );
    }

    // Generate certificate
    const certificateNumber = this.generateCertificateNumber(
      enrollment.userId,
      enrollment.courseId,
    );

    // Generate certificate URL (this could be a PDF generation service in a real app)
    const certificateUrl = this.generateCertificateUrl(
      enrollment.userId,
      enrollment.courseId,
      certificateNumber,
    );

    // Create certificate
    const certificate = this.certificatesRepository.create({
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      certificateNumber,
      certificateUrl,
      issueDate: new Date(),
      // You might set an expiry date based on course settings
      status: CertificateStatus.ACTIVE,
    });

    return this.certificatesRepository.save(certificate);
  }

  private generateCertificateNumber(userId: number, courseId: number): string {
    // Create a unique certificate number using UUID and course/user IDs
    const uniqueId = uuidv4().slice(0, 8).toUpperCase();
    return `CERT-${userId}-${courseId}-${uniqueId}`;
  }

  private generateCertificateUrl(
    userId: number,
    courseId: number,
    certificateNumber: string,
  ): string {
    // In a real application, this could generate and store a PDF
    // For now, we'll just return a placeholder URL
    return `/certificates/download/${certificateNumber}`;
  }
}
