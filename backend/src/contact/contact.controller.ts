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
import { ContactService } from './contact.service.js';
import { CreateContactMessageDto } from './dto/create-contact-message.dto.js';
import { ContactQueryDto } from './dto/contact-query.dto.js';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a contact message' })
  @ApiCreatedResponse({ description: 'Contact message received' })
  create(@Body() dto: CreateContactMessageDto) {
    return this.contactService.create(dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List contact messages (admin only)' })
  @ApiOkResponse({ description: 'Paginated list of contact messages' })
  findAll(@Query() query: ContactQueryDto) {
    return this.contactService.findAll(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a contact message by ID (admin only)' })
  @ApiOkResponse({ description: 'Contact message details' })
  findOne(@Param('id') id: string) {
    return this.contactService.findById(id);
  }

  @Patch(':id/read')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark a contact message as read (admin only)' })
  @ApiOkResponse({ description: 'Contact message marked as read' })
  markAsRead(@Param('id') id: string) {
    return this.contactService.markAsRead(id);
  }

  @Patch(':id/unread')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark a contact message as unread (admin only)' })
  @ApiOkResponse({ description: 'Contact message marked as unread' })
  markAsUnread(@Param('id') id: string) {
    return this.contactService.markAsUnread(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a contact message (admin only)' })
  @ApiOkResponse({ description: 'Contact message deleted successfully' })
  delete(@Param('id') id: string) {
    return this.contactService.delete(id);
  }
}
