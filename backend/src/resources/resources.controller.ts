import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { ResourceQueryDto } from './dto/resource-query.dto.js';
import { CreateResourceDto } from './dto/create-resource.dto.js';
import { UpdateResourceDto } from './dto/update-resource.dto.js';
import { UploadResourceDto } from './dto/upload-resource.dto.js';
import { ResourcesService } from './resources.service.js';
import { multerConfig } from '../common/utils/file-upload.js';

@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  @ApiOperation({ summary: 'List resources with filters' })
  @ApiOkResponse({ description: 'Paginated list of resources' })
  findAll(@Query() query: ResourceQueryDto) {
    return this.resourcesService.findAll(query);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get a resource by ID or slug' })
  @ApiOkResponse({ description: 'Resource details' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.resourcesService.findByIdOrSlug(idOrSlug);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new resource (admin only)' })
  @ApiCreatedResponse({ description: 'Resource created successfully' })
  create(@Body() dto: CreateResourceDto) {
    return this.resourcesService.create(dto);
  }

  @Post('upload')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadResourceDto })
  @ApiOperation({ summary: 'Upload a new resource with file (admin only)' })
  @ApiCreatedResponse({ description: 'Resource uploaded successfully' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadResourceDto,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    return this.resourcesService.createWithFile(dto, file);
  }

  @Patch(':idOrSlug')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a resource by ID or slug (admin only)' })
  @ApiOkResponse({ description: 'Resource updated successfully' })
  update(
    @Param('idOrSlug') idOrSlug: string,
    @Body() dto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(idOrSlug, dto);
  }

  @Patch(':idOrSlug/upload')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadResourceDto })
  @ApiOperation({ summary: 'Update a resource with new file (admin only)' })
  @ApiOkResponse({ description: 'Resource updated with new file successfully' })
  async updateWithFile(
    @Param('idOrSlug') idOrSlug: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadResourceDto,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    return this.resourcesService.updateWithFile(idOrSlug, dto, file);
  }

  @Delete(':idOrSlug')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a resource by ID or slug (admin only)' })
  @ApiOkResponse({ description: 'Resource deleted successfully' })
  delete(@Param('idOrSlug') idOrSlug: string) {
    return this.resourcesService.delete(idOrSlug);
  }
}
