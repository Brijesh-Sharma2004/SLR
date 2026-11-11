import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type ContactMessageDocument = HydratedDocument<ContactMessage>;

export enum ContactMessageStatus {
  Unread = 'UNREAD',
  Read = 'READ',
}

@Schema({ timestamps: true, versionKey: false })
export class ContactMessage {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  subject: string;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ required: true, enum: ContactMessageStatus, default: ContactMessageStatus.Unread })
  status: ContactMessageStatus;

  createdAt: Date;

  updatedAt: Date;
}

export const ContactMessageSchema =
  SchemaFactory.createForClass(ContactMessage);

ContactMessageSchema.index({ createdAt: -1 });
