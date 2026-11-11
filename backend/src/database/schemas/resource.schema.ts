import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, type HydratedDocument } from 'mongoose';

export type ResourceDocument = HydratedDocument<Resource>;

export enum ResourceType {
  Pdf = 'PDF',
  Video = 'VIDEO',
  Document = 'DOCUMENT',
  Other = 'OTHER',
}

@Schema({ timestamps: true, versionKey: false })
export class Resource {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, enum: ResourceType })
  type: ResourceType;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, trim: true })
  url: string;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true, index: true })
  subject: Types.ObjectId;

  @Prop({ required: false, trim: true })
  filePath?: string;

  @Prop({ required: false })
  fileSize?: number;

  @Prop({ required: false, trim: true })
  mimeType?: string;

  @Prop({ required: false, trim: true })
  originalFileName?: string;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);

ResourceSchema.index({ subject: 1, type: 1, title: 1 });
