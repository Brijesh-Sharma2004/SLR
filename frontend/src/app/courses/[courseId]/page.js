import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import SubjectCard from "@/components/subjects/SubjectCard";
import { ApiError } from "@/lib/api-errors";
import { apiServerGet } from "@/lib/server-api";

async function CourseContent({ params }) {
  const { courseId } = await params;

  let course;

  try {
    const response = await apiServerGet(
      `/courses/${encodeURIComponent(courseId)}`,
    );
    course = response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#211d50] sm:text-4xl">
          {course.name}
        </h1>

        <p className="mt-3 text-gray-600">{course.description}</p>

        <p className="mt-2 text-sm text-gray-500">
          Duration: {course.duration}
        </p>
      </div>

      <h2 className="mb-6 text-2xl font-bold text-[#29245e]">
        Available Subjects
      </h2>

      {course.subjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {course.subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#c9c5e8] bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-[#29245e]">
            No Subjects Available Yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Subjects for this course will be added soon.
          </p>
        </div>
      )}
    </>
  );
}

function CourseFallback() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-2/3 rounded bg-[#e2defa]" />
      <div className="h-5 w-full rounded bg-[#e2defa]" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-44 rounded-2xl bg-white" />
        ))}
      </div>
    </div>
  );
}

export default function CoursePage({ params }) {
  return (
    <main className="min-h-screen bg-[#f8f9ff] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/explore"
          className="mb-8 inline-flex items-center text-sm font-medium text-[#737cff] hover:text-[#454cff]"
        >
          ← Back to Courses
        </Link>

        <Suspense fallback={<CourseFallback />}>
          <CourseContent params={params} />
        </Suspense>
      </div>
    </main>
  );
}
