import type { Types } from 'mongoose';
import type { ResourceType } from '../database/schemas/resource.schema.js';

export interface ResourceLean {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  type: ResourceType;
  description: string;
  url: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  originalFileName?: string;
}

export interface SubjectRefLean {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  code: string;
}

export interface ResourceWithSubjectLean extends ResourceLean {
  subject: SubjectRefLean;
}

export interface ResourceSummary {
  id: string;
  slug: string;
  title: string;
  type: ResourceType;
  description: string;
  url: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  originalFileName?: string;
}

export interface ResourceWithSubjectSummary extends ResourceSummary {
  subject: {
    id: string;
    slug: string;
    name: string;
    code: string;
  };
}

export function toResourceSummary(
  resource: ResourceLean,
): ResourceSummary {
  return {
    id: resource._id.toString(),
    slug: resource.slug,
    title: resource.title,
    type: resource.type,
    description: resource.description,
    url: resource.url,
    filePath: resource.filePath,
    fileSize: resource.fileSize,
    mimeType: resource.mimeType,
    originalFileName: resource.originalFileName,
  };
}

export function toResourceWithSubjectSummary(
  resource: ResourceWithSubjectLean,
): ResourceWithSubjectSummary {
  return {
    ...toResourceSummary(resource),
    subject: {
      id: resource.subject._id.toString(),
      slug: resource.subject.slug,
      name: resource.subject.name,
      code: resource.subject.code,
    },
  };
}
