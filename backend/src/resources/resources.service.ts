import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { unlink } from 'fs/promises';
import { join } from 'path';
import {
  paginatedResponse,
  type PaginatedResponse,
} from '../common/utils/paginated-response.js';
import { escapeRegex } from '../common/utils/escape-regex.js';
import { slugify } from '../common/utils/slugify.js';
import { getFileUrl, uploadDir } from '../common/utils/file-upload.js';
import {
  Resource,
  ResourceType,
} from '../database/schemas/resource.schema.js';
import { Subject } from '../database/schemas/subject.schema.js';
import type { ResourceQueryDto } from './dto/resource-query.dto.js';
import type { CreateResourceDto } from './dto/create-resource.dto.js';
import type { UpdateResourceDto } from './dto/update-resource.dto.js';
import type { UploadResourceDto } from './dto/upload-resource.dto.js';
import {
  toResourceWithSubjectSummary,
  type ResourceWithSubjectLean,
  type ResourceWithSubjectSummary,
} from './resource.types.js';

interface ResourceFilter {
  _id?: Types.ObjectId;
  slug?: string;
  subject?: Types.ObjectId;
  type?: ResourceType;
  $or?: Array<{ title: RegExp } | { description: RegExp }>;
}

@Injectable()
export class ResourcesService {
  constructor(
    @InjectModel(Resource.name)
    private readonly resourceModel: Model<Resource>,
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<Subject>,
  ) {}

  async findAll(
    query: ResourceQueryDto,
  ): Promise<PaginatedResponse<ResourceWithSubjectSummary>> {
    const filter: ResourceFilter = {};

    if (query.subject) {
      const subject = await this.subjectModel
        .findOne({ slug: query.subject })
        .select('_id')
        .lean<{ _id: Types.ObjectId }>()
        .exec();

      if (!subject) {
        return paginatedResponse([], 0, query);
      }

      filter.subject = subject._id;
    }

    if (query.type) {
      filter.type = query.type;
    }

    if (query.q) {
      const search = new RegExp(escapeRegex(query.q), 'i');
      filter.$or = [
        { title: search },
        { description: search },
      ];
    }

    const skip = (query.page - 1) * query.limit;
    const [resources, total] = await Promise.all([
      this.resourceModel
        .find(filter)
        .populate('subject', 'name slug code')
        .sort({ title: 1 })
        .skip(skip)
        .limit(query.limit)
        .lean<ResourceWithSubjectLean[]>()
        .exec(),
      this.resourceModel.countDocuments(filter).exec(),
    ]);

    return paginatedResponse(
      resources.map((resource) =>
        toResourceWithSubjectSummary(resource),
      ),
      total,
      query,
    );
  }

  async findByIdOrSlug(
    idOrSlug: string,
  ): Promise<ResourceWithSubjectSummary> {
    const filter: ResourceFilter = Types.ObjectId.isValid(idOrSlug)
      ? { _id: new Types.ObjectId(idOrSlug) }
      : { slug: idOrSlug };

    const resource = await this.resourceModel
      .findOne(filter)
      .populate('subject', 'name slug code')
      .lean<ResourceWithSubjectLean>()
      .exec();

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return toResourceWithSubjectSummary(resource);
  }

  async create(
    dto: CreateResourceDto,
  ): Promise<ResourceWithSubjectSummary> {
    const subject = await this.subjectModel
      .findById(dto.subjectId)
      .select('_id')
      .lean<{ _id: Types.ObjectId }>()
      .exec();

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    let slug = slugify(dto.title);
    let existing = await this.resourceModel.findOne({ slug }).exec();
    let counter = 1;

    while (existing) {
      slug = `${slugify(dto.title)}-${counter}`;
      existing = await this.resourceModel.findOne({ slug }).exec();
      counter++;
    }

    const resource = await this.resourceModel.create({
      title: dto.title,
      slug,
      type: dto.type,
      description: dto.description,
      url: dto.url,
      subject: subject._id,
    });

    return this.findByIdOrSlug(resource._id.toString());
  }

  async createWithFile(
    dto: UploadResourceDto,
    file: Express.Multer.File,
  ): Promise<ResourceWithSubjectSummary> {
    const subject = await this.subjectModel
      .findById(dto.subjectId)
      .select('_id')
      .lean<{ _id: Types.ObjectId }>()
      .exec();

    if (!subject) {
      await this.deleteFile(file.filename);
      throw new NotFoundException('Subject not found');
    }

    let slug = slugify(dto.title);
    let existing = await this.resourceModel.findOne({ slug }).exec();
    let counter = 1;

    while (existing) {
      slug = `${slugify(dto.title)}-${counter}`;
      existing = await this.resourceModel.findOne({ slug }).exec();
      counter++;
    }

    const fileUrl = getFileUrl(file.filename);

    const resource = await this.resourceModel.create({
      title: dto.title,
      slug,
      type: dto.type,
      description: dto.description,
      url: dto.url ?? fileUrl,
      subject: subject._id,
      filePath: file.filename,
      fileSize: file.size,
      mimeType: file.mimetype,
      originalFileName: file.originalname,
    });

    return this.findByIdOrSlug(resource._id.toString());
  }

  async update(
    idOrSlug: string,
    dto: UpdateResourceDto,
  ): Promise<ResourceWithSubjectSummary> {
    const filter: ResourceFilter = Types.ObjectId.isValid(idOrSlug)
      ? { _id: new Types.ObjectId(idOrSlug) }
      : { slug: idOrSlug };

    const updateData: Partial<{
      title: string;
      slug: string;
      type: ResourceType;
      description: string;
      url: string;
      subject: Types.ObjectId;
    }> = {};

    if (dto.title !== undefined) {
      updateData.title = dto.title;
      let slug = slugify(dto.title);
      let existing = await this.resourceModel.findOne({ slug }).exec();
      let counter = 1;

      while (existing && existing._id.toString() !== filter._id?.toString()) {
        slug = `${slugify(dto.title)}-${counter}`;
        existing = await this.resourceModel.findOne({ slug }).exec();
        counter++;
      }
      updateData.slug = slug;
    }

    if (dto.type !== undefined) {
      updateData.type = dto.type;
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    if (dto.url !== undefined) {
      updateData.url = dto.url;
    }

    if (dto.subjectId !== undefined) {
      const subject = await this.subjectModel
        .findById(dto.subjectId)
        .select('_id')
        .lean<{ _id: Types.ObjectId }>()
        .exec();

      if (!subject) {
        throw new NotFoundException('Subject not found');
      }
      updateData.subject = subject._id;
    }

    const resource = await this.resourceModel
      .findOneAndUpdate(filter, { $set: updateData }, { new: true })
      .populate('subject', 'name slug code')
      .lean<ResourceWithSubjectLean>()
      .exec();

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return toResourceWithSubjectSummary(resource);
  }

  async updateWithFile(
    idOrSlug: string,
    dto: UploadResourceDto,
    file: Express.Multer.File,
  ): Promise<ResourceWithSubjectSummary> {
    const filter: ResourceFilter = Types.ObjectId.isValid(idOrSlug)
      ? { _id: new Types.ObjectId(idOrSlug) }
      : { slug: idOrSlug };

    const existingResource = await this.resourceModel.findOne(filter).exec();

    if (!existingResource) {
      await this.deleteFile(file.filename);
      throw new NotFoundException('Resource not found');
    }

    const subject = await this.subjectModel
      .findById(dto.subjectId)
      .select('_id')
      .lean<{ _id: Types.ObjectId }>()
      .exec();

    if (!subject) {
      await this.deleteFile(file.filename);
      throw new NotFoundException('Subject not found');
    }

    let slug = slugify(dto.title);
    let existing = await this.resourceModel.findOne({ slug }).exec();
    let counter = 1;

    while (existing && existing._id.toString() !== existingResource._id.toString()) {
      slug = `${slugify(dto.title)}-${counter}`;
      existing = await this.resourceModel.findOne({ slug }).exec();
      counter++;
    }

    const fileUrl = getFileUrl(file.filename);

    if (existingResource.filePath) {
      await this.deleteFile(existingResource.filePath);
    }

    const resource = await this.resourceModel
      .findOneAndUpdate(
        filter,
        {
          $set: {
            title: dto.title,
            slug,
            type: dto.type,
            description: dto.description,
            url: dto.url ?? fileUrl,
            subject: subject._id,
            filePath: file.filename,
            fileSize: file.size,
            mimeType: file.mimetype,
            originalFileName: file.originalname,
          },
        },
        { new: true },
      )
      .populate('subject', 'name slug code')
      .lean<ResourceWithSubjectLean>()
      .exec();

    if (!resource) {
      await this.deleteFile(file.filename);
      throw new NotFoundException('Resource not found');
    }

    return toResourceWithSubjectSummary(resource);
  }

  async delete(idOrSlug: string): Promise<{ message: string }> {
    const filter: ResourceFilter = Types.ObjectId.isValid(idOrSlug)
      ? { _id: new Types.ObjectId(idOrSlug) }
      : { slug: idOrSlug };

    const resource = await this.resourceModel.findOne(filter).exec();

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (resource.filePath) {
      await this.deleteFile(resource.filePath);
    }

    await this.resourceModel.findOneAndDelete(filter).exec();

    return { message: 'Resource deleted successfully' };
  }

  private async deleteFile(filename: string): Promise<void> {
    try {
      const filePath = join(uploadDir, filename);
      await unlink(filePath);
    } catch {
      // Ignore file deletion errors
    }
  }
}
