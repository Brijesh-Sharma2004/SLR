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
import { SubjectQueryDto } from './dto/subject-query.dto.js';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/create-subject.dto.js';
import { SubjectsService } from './subjects.service.js';

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List subjects, optionally filtered by course' })
  @ApiOkResponse({ description: 'Paginated list of subjects' })
  findAll(@Query() query: SubjectQueryDto) {
    return this.subjectsService.findAll(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a subject and its resources by slug' })
  @ApiOkResponse({ description: 'Subject details with resources' })
  findBySlug(@Param('slug') slug: string) {
    return this.subjectsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new subject (admin only)' })
  @ApiCreatedResponse({ description: 'Subject created successfully' })
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectsService.create(dto);
  }

  @Patch(':idOrSlug')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a subject by ID or slug (admin only)' })
  @ApiOkResponse({ description: 'Subject updated successfully' })
  update(
    @Param('idOrSlug') idOrSlug: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.subjectsService.update(idOrSlug, dto);
  }

  @Delete(':idOrSlug')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a subject by ID or slug (admin only)' })
  @ApiOkResponse({ description: 'Subject deleted successfully' })
  delete(@Param('idOrSlug') idOrSlug: string) {
    return this.subjectsService.delete(idOrSlug);
  }
}
