import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { escapeRegex } from '../common/utils/escape-regex.js';
import {
  toCourseSummary,
  type CourseListAggregate,
  type CourseSummary,
} from '../courses/course.types.js';
import { Course } from '../database/schemas/course.schema.js';
import { Resource } from '../database/schemas/resource.schema.js';
import { Subject } from '../database/schemas/subject.schema.js';
import {
  toResourceWithSubjectSummary,
  type ResourceWithSubjectLean,
  type ResourceWithSubjectSummary,
} from '../resources/resource.types.js';
import {
  toSubjectSummary,
  type SubjectSummary,
  type SubjectWithCourseLean,
} from '../subjects/subject.types.js';
import type { SearchQueryDto } from './dto/search-query.dto.js';

export interface SearchResults {
  data: {
    courses: CourseSummary[];
    subjects: SubjectSummary[];
    resources: ResourceWithSubjectSummary[];
  };
  meta: {
    query: string;
    limit: number;
    total: number;
  };
}

interface ResourceCount {
  _id: unknown;
  count: number;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<Course>,
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<Subject>,
    @InjectModel(Resource.name)
    private readonly resourceModel: Model<Resource>,
  ) {}

  async search(query: SearchQueryDto): Promise<SearchResults> {
    const search = new RegExp(escapeRegex(query.q), 'i');

    const [courses, subjects, resources] = await Promise.all([
      this.courseModel
        .aggregate<CourseListAggregate>([
          {
            $match: {
              $or: [
                { name: search },
                { description: search },
                { slug: search },
              ],
            },
          },
          { $sort: { name: 1 } },
          { $limit: query.limit },
          {
            $lookup: {
              from: this.subjectModel.collection.name,
              localField: '_id',
              foreignField: 'course',
              as: 'courseSubjects',
            },
          },
          {
            $project: {
              name: 1,
              slug: 1,
              description: 1,
              duration: 1,
              subjectCount: { $size: '$courseSubjects' },
            },
          },
        ])
        .exec(),
      this.subjectModel
        .find({
          $or: [{ name: search }, { code: search }, { slug: search }],
        })
        .populate('course', 'name slug')
        .sort({ name: 1 })
        .limit(query.limit)
        .lean<SubjectWithCourseLean[]>()
        .exec(),
      this.resourceModel
        .find({
          $or: [
            { title: search },
            { description: search },
            { slug: search },
          ],
        })
        .populate('subject', 'name slug code')
        .sort({ title: 1 })
        .limit(query.limit)
        .lean<ResourceWithSubjectLean[]>()
        .exec(),
    ]);

    const resourceCounts = await this.resourceModel
      .aggregate<ResourceCount>([
        {
          $match: {
            subject: { $in: subjects.map((subject) => subject._id) },
          },
        },
        { $group: { _id: '$subject', count: { $sum: 1 } } },
      ])
      .exec();

    const countBySubject = new Map(
      resourceCounts.map((item) => [String(item._id), item.count]),
    );

    return {
      data: {
        courses: courses.map((course) => toCourseSummary(course)),
        subjects: subjects.map((subject) =>
          toSubjectSummary(
            subject,
            countBySubject.get(subject._id.toString()) ?? 0,
          ),
        ),
        resources: resources.map((resource) =>
          toResourceWithSubjectSummary(resource),
        ),
      },
      meta: {
        query: query.q,
        limit: query.limit,
        total:
          courses.length + subjects.length + resources.length,
      },
    };
  }
}
