import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  paginatedResponse,
  type PaginatedResponse,
} from '../common/utils/paginated-response.js';
import {
  ContactMessage,
  ContactMessageStatus,
  type ContactMessageDocument,
} from '../database/schemas/contact-message.schema.js';
import type { CreateContactMessageDto } from './dto/create-contact-message.dto.js';
import type { ContactQueryDto } from './dto/contact-query.dto.js';

export interface ContactMessageReceipt {
  id: string;
  createdAt: string;
}

export interface ContactMessageSummary {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
  updatedAt: string;
}

function toContactMessageSummary(
  contactMessage: ContactMessageDocument,
): ContactMessageSummary {
  return {
    id: contactMessage._id.toString(),
    name: contactMessage.name,
    email: contactMessage.email,
    subject: contactMessage.subject,
    message: contactMessage.message,
    status: contactMessage.status,
    createdAt: contactMessage.createdAt.toISOString(),
    updatedAt: contactMessage.updatedAt.toISOString(),
  };
}

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(ContactMessage.name)
    private readonly contactMessageModel: Model<ContactMessage>,
  ) {}

  async create(
    dto: CreateContactMessageDto,
  ): Promise<ContactMessageReceipt> {
    const contactMessage: ContactMessageDocument =
      await this.contactMessageModel.create(dto);

    return {
      id: contactMessage._id.toString(),
      createdAt: contactMessage.createdAt.toISOString(),
    };
  }

  async findAll(
    query: ContactQueryDto,
  ): Promise<PaginatedResponse<ContactMessageSummary>> {
    const filter: Record<string, unknown> = {};

    if (query.email) {
      filter.email = query.email;
    }

    if (query.status) {
      filter.status = query.status;
    }

    const skip = (query.page - 1) * query.limit;
    const [messages, total] = await Promise.all([
      this.contactMessageModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .lean<ContactMessageDocument[]>()
        .exec(),
      this.contactMessageModel.countDocuments(filter).exec(),
    ]);

    return paginatedResponse(
      messages.map((msg) => toContactMessageSummary(msg)),
      total,
      query,
    );
  }

  async findById(id: string): Promise<ContactMessageSummary> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Contact message not found');
    }

    const message = await this.contactMessageModel
      .findById(id)
      .lean<ContactMessageDocument>()
      .exec();

    if (!message) {
      throw new NotFoundException('Contact message not found');
    }

    return toContactMessageSummary(message);
  }

  async markAsRead(id: string): Promise<ContactMessageSummary> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Contact message not found');
    }

    const message = await this.contactMessageModel
      .findByIdAndUpdate(
        id,
        { $set: { status: ContactMessageStatus.Read } },
        { new: true, runValidators: true },
      )
      .lean<ContactMessageDocument>()
      .exec();

    if (!message) {
      throw new NotFoundException('Contact message not found');
    }

    return toContactMessageSummary(message);
  }

  async markAsUnread(id: string): Promise<ContactMessageSummary> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Contact message not found');
    }

    const message = await this.contactMessageModel
      .findByIdAndUpdate(
        id,
        { $set: { status: ContactMessageStatus.Unread } },
        { new: true, runValidators: true },
      )
      .lean<ContactMessageDocument>()
      .exec();

    if (!message) {
      throw new NotFoundException('Contact message not found');
    }

    return toContactMessageSummary(message);
  }

  async delete(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Contact message not found');
    }

    const result = await this.contactMessageModel
      .findByIdAndDelete(id)
      .exec();

    if (!result) {
      throw new NotFoundException('Contact message not found');
    }

    return { message: 'Contact message deleted successfully' };
  }
}
