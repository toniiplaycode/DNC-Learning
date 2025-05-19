import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { CreateMultipleCertificatesDto } from './dto/create-multiple-certificates.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/User';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { VerifyCertificateDto } from './dto/verify-certificate.dto';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  create(@Body() createCertificateDto: CreateCertificateDto) {
    return this.certificatesService.create(createCertificateDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  findAll(@Query('status') status?: string) {
    return this.certificatesService.findAll(status);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUser() user,
    @Query('status') status?: string,
  ) {
    // Students can only access their own certificates
    if (user.role === UserRole.STUDENT && user.id !== userId) {
      userId = user.id;
    }

    return this.certificatesService.findByUser(userId, status);
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  findByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('status') status?: string,
  ) {
    return this.certificatesService.findByCourse(courseId, status);
  }

  @Get('verify')
  verifyPublic(@Query() verifyCertificateDto: VerifyCertificateDto) {
    return this.certificatesService.verifyCertificate(
      verifyCertificateDto.certificateNumber,
    );
  }

  @Post('generate/:enrollmentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  generateCertificate(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ) {
    return this.certificatesService.generateCertificate(enrollmentId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    const certificate = await this.certificatesService.findOne(id);

    // Students can only access their own certificates
    if (user.role === UserRole.STUDENT && certificate.userId !== user.id) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }

    return certificate;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCertificateDto: UpdateCertificateDto,
  ) {
    return this.certificatesService.update(id, updateCertificateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.certificatesService.remove(id);
  }

  @Post('multiple')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  createMultiple(
    @Body() createMultipleCertificatesDto: CreateMultipleCertificatesDto,
  ) {
    return this.certificatesService.createMultiple(
      createMultipleCertificatesDto,
    );
  }
}
