import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { MajorService } from './major.service';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';

@Controller('majors')
export class MajorController {
  constructor(private readonly majorService: MajorService) {}

  @Post()
  create(@Body() createDto: CreateMajorDto) {
    return this.majorService.create(createDto);
  }

  @Get()
  findAll(@Query('facultyId') facultyId?: number) {
    if (facultyId) {
      return this.majorService.findByFaculty(facultyId);
    }
    return this.majorService.findAll();
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.majorService.findByCode(code);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.majorService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMajorDto,
  ) {
    return this.majorService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.majorService.remove(id);
  }
}
