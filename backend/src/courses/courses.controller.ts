import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../database/schemas/user.schema.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { CreateCourseDto, UpdateCourseDto } from './dto/create-course.dto.js';
import { CoursesService } from './courses.service.js';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List courses' })
  @ApiOkResponse({ description: 'Paginated list of courses' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.coursesService.findAll(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a course and its subjects by slug' })
  @ApiOkResponse({ description: 'Course details' })
  findBySlug(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course (admin only)' })
  @ApiCreatedResponse({ description: 'Course created successfully' })
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @Patch(':idOrSlug')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a course by ID or slug (admin only)' })
  @ApiOkResponse({ description: 'Course updated successfully' })
  update(
    @Param('idOrSlug') idOrSlug: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(idOrSlug, dto);
  }

  @Delete(':idOrSlug')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a course by ID or slug (admin only)' })
  @ApiOkResponse({ description: 'Course deleted successfully' })
  delete(@Param('idOrSlug') idOrSlug: string) {
    return this.coursesService.delete(idOrSlug);
  }
}
