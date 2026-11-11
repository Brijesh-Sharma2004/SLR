import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { slugify } from '../common/utils/slugify.js';
import {
  paginatedResponse,
  type PaginatedResponse,
} from '../common/utils/paginated-response.js';
import { Course } from '../database/schemas/course.schema.js';
import { Resource } from '../database/schemas/resource.schema.js';
import { Subject } from '../database/schemas/subject.schema.js';
import {
  toResourceSummary,
  type ResourceLean,
  type ResourceSummary,
} from '../resources/resource.types.js';
import type { SubjectQueryDto } from './dto/subject-query.dto.js';
import type { CreateSubjectDto, UpdateSubjectDto } from './dto/create-subject.dto.js';
import {
  toSubjectSummary,
  type SubjectSummary,
  type SubjectWithCourseLean,
} from './subject.types.js';

export interface SubjectDetail extends SubjectSummary {
  resources: ResourceSummary[];
}

interface ResourceCount {
  _id: unknown;
  count: number;
}

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<Subject>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<Course>,
    @InjectModel(Resource.name)
    private readonly resourceModel: Model<Resource>,
  ) {}

  async findAll(
    query: SubjectQueryDto,
  ): Promise<PaginatedResponse<SubjectSummary>> {
    const filter: { course?: Types.ObjectId } = {};

    if (query.course) {
      const course = await this.courseModel
        .findOne({ slug: query.course })
        .select('_id')
        .lean<{ _id: Types.ObjectId }>()
        .exec();

      if (!course) {
        return paginatedResponse([], 0, query);
      }

      filter.course = course._id;
    }

    const skip = (query.page - 1) * query.limit;
    const [subjects, total] = await Promise.all([
      this.subjectModel
        .find(filter)
        .populate('course', 'name slug')
        .sort({ name: 1 })
        .skip(skip)
        .limit(query.limit)
        .lean<SubjectWithCourseLean[]>()
        .exec(),
      this.subjectModel.countDocuments(filter).exec(),
    ]);

    const subjectIds = subjects.map((subject) => subject._id);
    const resourceCounts = await this.resourceModel
      .aggregate<ResourceCount>([
        { $match: { subject: { $in: subjectIds } } },
        { $group: { _id: '$subject', count: { $sum: 1 } } },
      ])
      .exec();

    const countBySubject = new Map(
      resourceCounts.map((item) => [String(item._id), item.count]),
    );

    return paginatedResponse(
      subjects.map((subject) =>
        toSubjectSummary(
          subject,
          countBySubject.get(subject._id.toString()) ?? 0,
        ),
      ),
      total,
      query,
    );
  }

  async findBySlug(slug: string): Promise<SubjectDetail> {
    const subject = await this.subjectModel
      .findOne({ slug })
      .populate('course', 'name slug')
      .lean<SubjectWithCourseLean>()
      .exec();

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    const resources = await this.resourceModel
      .find({ subject: subject._id })
      .sort({ title: 1 })
      .lean<ResourceLean[]>()
      .exec();

    return {
      ...toSubjectSummary(subject, resources.length),
      resources: resources.map((resource) =>
        toResourceSummary(resource),
      ),
    };
  }

  async create(dto: CreateSubjectDto): Promise<SubjectSummary> {
    const course = await this.courseModel
      .findById(dto.courseId)
      .select('_id')
      .lean<{ _id: Types.ObjectId }>()
      .exec();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    let slug = slugify(dto.name);
    let existing = await this.subjectModel.findOne({ slug }).exec();
    let counter = 1;

    while (existing) {
      slug = `${slugify(dto.name)}-${counter}`;
      existing = await this.subjectModel.findOne({ slug }).exec();
      counter++;
    }

    try {
      const subject = await this.subjectModel.create({
        name: dto.name,
        slug,
        code: dto.code,
        description: dto.description,
        course: course._id,
      });

      return toSubjectSummary(subject, 0);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('A subject with this code already exists');
      }
      throw error;
    }
  }

  async update(
    idOrSlug: string,
    dto: UpdateSubjectDto,
  ): Promise<SubjectSummary> {
    const filter = Types.ObjectId.isValid(idOrSlug)
      ? { _id: new Types.ObjectId(idOrSlug) }
      : { slug: idOrSlug };

    const updateData: Partial<{
      name: string;
      slug: string;
      code: string;
      description: string;
      course: Types.ObjectId;
    }> = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
      let slug = slugify(dto.name);
      let existing = await this.subjectModel.findOne({ slug }).exec();
      let counter = 1;

      while (existing && existing._id.toString() !== filter._id?.toString()) {
        slug = `${slugify(dto.name)}-${counter}`;
        existing = await this.subjectModel.findOne({ slug }).exec();
        counter++;
      }
      updateData.slug = slug;
    }

    if (dto.code !== undefined) {
      updateData.code = dto.code;
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    if (dto.courseId !== undefined) {
      const course = await this.courseModel
        .findById(dto.courseId)
        .select('_id')
        .lean<{ _id: Types.ObjectId }>()
        .exec();

      if (!course) {
        throw new NotFoundException('Course not found');
      }
      updateData.course = course._id;
    }

    const subject = await this.subjectModel
      .findOneAndUpdate(filter, { $set: updateData }, { new: true })
      .populate('course', 'name slug')
      .lean<SubjectWithCourseLean>()
      .exec();

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    const resourceCount = await this.resourceModel
      .countDocuments({ subject: subject._id })
      .exec();

    return toSubjectSummary(subject, resourceCount);
  }

  async delete(idOrSlug: string): Promise<{ message: string }> {
    const filter = Types.ObjectId.isValid(idOrSlug)
      ? { _id: new Types.ObjectId(idOrSlug) }
      : { slug: idOrSlug };

    const subject = await this.subjectModel.findOne(filter).exec();

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    await this.resourceModel
      .deleteMany({ subject: subject._id })
      .exec();

    await this.subjectModel.findOneAndDelete(filter).exec();

    return { message: 'Subject deleted successfully' };
  }

  private isDuplicateKeyError(error: unknown): boolean {
    const code = (error as { code?: unknown }).code;
    return code === 11000;
  }
}
