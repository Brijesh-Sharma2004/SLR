import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { slugify } from '../common/utils/slugify.js';
import type { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import {
  paginatedResponse,
  type PaginatedResponse,
} from '../common/utils/paginated-response.js';
import { Course } from '../database/schemas/course.schema.js';
import { Resource } from '../database/schemas/resource.schema.js';
import { Subject } from '../database/schemas/subject.schema.js';
import {
  toCourseSummary,
  type CourseLean,
  type CourseListAggregate,
  type CourseSummary,
} from './course.types.js';
import {
  toSubjectSummary,
  type SubjectSummary,
  type SubjectWithCourseLean,
} from '../subjects/subject.types.js';
import type { CreateCourseDto, UpdateCourseDto } from './dto/create-course.dto.js';

export interface CourseDetail extends CourseSummary {
  subjects: SubjectSummary[];
}

interface ResourceCount {
  _id: unknown;
  count: number;
}

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<Course>,
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<Subject>,
    @InjectModel(Resource.name)
    private readonly resourceModel: Model<Resource>,
  ) {}

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<CourseSummary>> {
    const skip = (query.page - 1) * query.limit;

    const [courses, total] = await Promise.all([
      this.courseModel
        .aggregate<CourseListAggregate>([
          { $sort: { name: 1 } },
          { $skip: skip },
          { $limit: query.limit },
          {
            $lookup: {
              from: this.subjectModel.collection.name,
              localField: '_id',
              foreignField: 'course',
              as: 'subjects',
            },
          },
          {
            $project: {
              name: 1,
              slug: 1,
              description: 1,
              duration: 1,
              subjectCount: { $size: '$subjects' },
            },
          },
        ])
        .exec(),
      this.courseModel.countDocuments().exec(),
    ]);

    return paginatedResponse(
      courses.map((course) => toCourseSummary(course)),
      total,
      query,
    );
  }

  async findBySlug(slug: string): Promise<CourseDetail> {
    const course = await this.courseModel
      .findOne({ slug })
      .lean<CourseLean>()
      .exec();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const subjects = await this.subjectModel
      .find({ course: course._id })
      .populate('course', 'name slug')
      .sort({ name: 1 })
      .lean<SubjectWithCourseLean[]>()
      .exec();

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

    return {
      id: course._id.toString(),
      slug: course.slug,
      name: course.name,
      description: course.description,
      duration: course.duration,
      subjectCount: subjects.length,
      subjects: subjects.map((subject) =>
        toSubjectSummary(
          subject,
          countBySubject.get(subject._id.toString()) ?? 0,
        ),
      ),
    };
  }

  async create(dto: CreateCourseDto): Promise<CourseSummary> {
    let slug = slugify(dto.name);
    let existing = await this.courseModel.findOne({ slug }).exec();
    let counter = 1;

    while (existing) {
      slug = `${slugify(dto.name)}-${counter}`;
      existing = await this.courseModel.findOne({ slug }).exec();
      counter++;
    }

    try {
      const course = await this.courseModel.create({
        name: dto.name,
        slug,
        description: dto.description,
        duration: dto.duration,
      });

      return toCourseSummary(course);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('A course with this name already exists');
      }
      throw error;
    }
  }

  async update(
    idOrSlug: string,
    dto: UpdateCourseDto,
  ): Promise<CourseSummary> {
    const filter = Types.ObjectId.isValid(idOrSlug)
      ? { _id: new Types.ObjectId(idOrSlug) }
      : { slug: idOrSlug };

    const updateData: Partial<{
      name: string;
      slug: string;
      description: string;
      duration: string;
    }> = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
      let slug = slugify(dto.name);
      let existing = await this.courseModel.findOne({ slug }).exec();
      let counter = 1;

      while (existing && existing._id.toString() !== filter._id?.toString()) {
        slug = `${slugify(dto.name)}-${counter}`;
        existing = await this.courseModel.findOne({ slug }).exec();
        counter++;
      }
      updateData.slug = slug;
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    if (dto.duration !== undefined) {
      updateData.duration = dto.duration;
    }

    const course = await this.courseModel
      .findOneAndUpdate(filter, { $set: updateData }, { new: true })
      .lean<CourseLean>()
      .exec();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return toCourseSummary(course);
  }

  async delete(idOrSlug: string): Promise<{ message: string }> {
    const filter = Types.ObjectId.isValid(idOrSlug)
      ? { _id: new Types.ObjectId(idOrSlug) }
      : { slug: idOrSlug };

    const course = await this.courseModel.findOne(filter).exec();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const subjectIds = await this.subjectModel
      .find({ course: course._id })
      .select('_id')
      .lean<{ _id: Types.ObjectId }[]>()
      .exec();

    if (subjectIds.length > 0) {
      const subjectIdValues = subjectIds.map((s) => s._id);
      await this.resourceModel
        .deleteMany({ subject: { $in: subjectIdValues } })
        .exec();
      await this.subjectModel
        .deleteMany({ course: course._id })
        .exec();
    }

    await this.courseModel.findOneAndDelete(filter).exec();

    return { message: 'Course deleted successfully' };
  }

  private isDuplicateKeyError(error: unknown): boolean {
    const code = (error as { code?: unknown }).code;
    return code === 11000;
  }
}
