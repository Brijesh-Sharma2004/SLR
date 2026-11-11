import type { Types } from 'mongoose';

export interface CourseLean {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  duration: string;
}

export interface CourseListAggregate extends CourseLean {
  subjectCount: number;
}

export interface CourseSummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  duration: string;
  subjectCount: number;
}

export function toCourseSummary(
  course: CourseLean & { subjectCount?: number },
): CourseSummary {
  return {
    id: course._id.toString(),
    slug: course.slug,
    name: course.name,
    description: course.description,
    duration: course.duration,
    subjectCount: course.subjectCount ?? 0,
  };
}
