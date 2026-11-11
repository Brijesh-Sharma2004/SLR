import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course } from '../database/schemas/course.schema.js';
import {
  Resource,
  ResourceType,
} from '../database/schemas/resource.schema.js';
import { Subject } from '../database/schemas/subject.schema.js';

interface CourseSeed {
  slug: string;
  name: string;
  description: string;
  duration: string;
}

interface SubjectSeed {
  slug: string;
  name: string;
  code: string;
  courseSlug: string;
}

interface ResourceSeed {
  slug: string;
  title: string;
  type: ResourceType;
  description: string;
  url: string;
  subjectSlug: string;
}

const COURSE_SEEDS: CourseSeed[] = [
  {
    slug: 'btech-cse',
    name: 'B.Tech Computer Science',
    description:
      'Explore computer science subjects and their learning resources.',
    duration: '4 Years',
  },
  {
    slug: 'btech-it',
    name: 'B.Tech Information Technology',
    description:
      'Explore information technology subjects and study materials.',
    duration: '4 Years',
  },
];

const SUBJECT_SEEDS: SubjectSeed[] = [
  {
    slug: 'dbms',
    name: 'Database Management Systems',
    code: 'CS301',
    courseSlug: 'btech-cse',
  },
  {
    slug: 'computer-networks',
    name: 'Computer Networks',
    code: 'CS302',
    courseSlug: 'btech-cse',
  },
  {
    slug: 'operating-systems',
    name: 'Operating Systems',
    code: 'CS303',
    courseSlug: 'btech-cse',
  },
  {
    slug: 'data-structures',
    name: 'Data Structures',
    code: 'CS304',
    courseSlug: 'btech-cse',
  },
  {
    slug: 'web-technology',
    name: 'Web Technology',
    code: 'IT301',
    courseSlug: 'btech-it',
  },
  {
    slug: 'software-engineering',
    name: 'Software Engineering',
    code: 'IT302',
    courseSlug: 'btech-it',
  },
];

const RESOURCE_SEEDS: ResourceSeed[] = [
  {
    slug: 'dbms-notes-1',
    title: 'DBMS Unit 1 Notes',
    type: ResourceType.Pdf,
    description: 'Introduction to database management systems.',
    url: '/resources/dbms/unit-1-notes.pdf',
    subjectSlug: 'dbms',
  },
  {
    slug: 'dbms-paper-1',
    title: 'DBMS Previous Year Question Paper',
    type: ResourceType.Pdf,
    description: 'Practice questions for examination preparation.',
    url: '/resources/dbms/previous-year-paper.pdf',
    subjectSlug: 'dbms',
  },
  {
    slug: 'dbms-video-1',
    title: 'DBMS Introduction Lecture',
    type: ResourceType.Video,
    description: 'Introduction to DBMS concepts.',
    url: 'https://youtu.be/dl00fOOYLOM?si=l2qQh3MjPf_2S9Ys',
    subjectSlug: 'dbms',
  },
  {
    slug: 'cn-notes',
    title: 'Computer Networks Full Notes',
    type: ResourceType.Pdf,
    description: 'Full computer networks notes.',
    url: '/resources/computer-networks/CN-full-notes.pdf',
    subjectSlug: 'computer-networks',
  },
];

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<Course>,
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<Subject>,
    @InjectModel(Resource.name)
    private readonly resourceModel: Model<Resource>,
  ) {}

  async run(): Promise<void> {
    const courseIds = await this.seedCourses();
    const subjectIds = await this.seedSubjects(courseIds);
    await this.seedResources(subjectIds);

    this.logger.log('Seed completed successfully');
  }

  private async seedCourses(): Promise<Map<string, Types.ObjectId>> {
    for (const seed of COURSE_SEEDS) {
      await this.courseModel
        .updateOne({ slug: seed.slug }, { $set: seed }, { upsert: true })
        .exec();
    }

    const courses = await this.courseModel
      .find({ slug: { $in: COURSE_SEEDS.map((seed) => seed.slug) } })
      .exec();

    this.logger.log(`Seeded ${courses.length} courses`);

    return new Map(courses.map((course) => [course.slug, course._id]));
  }

  private async seedSubjects(
    courseIds: Map<string, Types.ObjectId>,
  ): Promise<Map<string, Types.ObjectId>> {
    for (const seed of SUBJECT_SEEDS) {
      const courseId = courseIds.get(seed.courseSlug);

      if (!courseId) {
        throw new Error(
          `Cannot seed subject "${seed.slug}": course "${seed.courseSlug}" was not found`,
        );
      }

      await this.subjectModel
        .updateOne(
          { slug: seed.slug },
          {
            $set: {
              name: seed.name,
              code: seed.code,
              course: courseId,
            },
          },
          { upsert: true },
        )
        .exec();
    }

    const subjects = await this.subjectModel
      .find({ slug: { $in: SUBJECT_SEEDS.map((seed) => seed.slug) } })
      .exec();

    this.logger.log(`Seeded ${subjects.length} subjects`);

    return new Map(subjects.map((subject) => [subject.slug, subject._id]));
  }

  private async seedResources(
    subjectIds: Map<string, Types.ObjectId>,
  ): Promise<void> {
    for (const seed of RESOURCE_SEEDS) {
      const subjectId = subjectIds.get(seed.subjectSlug);

      if (!subjectId) {
        throw new Error(
          `Cannot seed resource "${seed.slug}": subject "${seed.subjectSlug}" was not found`,
        );
      }

      await this.resourceModel
        .updateOne(
          { slug: seed.slug },
          {
            $set: {
              title: seed.title,
              type: seed.type,
              description: seed.description,
              url: seed.url,
              subject: subjectId,
            },
          },
          { upsert: true },
        )
        .exec();
    }

    this.logger.log(`Seeded ${RESOURCE_SEEDS.length} resources`);
  }
}
