import type { Types } from 'mongoose';

export interface CourseRefLean {
  _id: Types.ObjectId;
  name: string;
  slug: string;
}

export interface SubjectLean {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  code: string;
  course: Types.ObjectId | CourseRefLean;
}

export interface SubjectWithCourseLean extends SubjectLean {
  description: string;
}

export interface SubjectSummary {
  id: string;
  slug: string;
  name: string;
  code: string;
  course: {
    id: string;
    name: string;
    slug: string;
  };
  resourceCount: number;
}

export function toSubjectSummary(
  subject: SubjectLean,
  resourceCount = 0,
): SubjectSummary {
  const courseRef =
    'name' in subject.course
      ? subject.course
      : { _id: subject.course, name: '', slug: '' };

  return {
    id: subject._id.toString(),
    slug: subject.slug,
    name: subject.name,
    code: subject.code,
    course: {
      id: courseRef._id.toString(),
      name: courseRef.name,
      slug: courseRef.slug,
    },
    resourceCount,
  };
}
