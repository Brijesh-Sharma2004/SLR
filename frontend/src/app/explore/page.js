import { Suspense } from "react";

import CourseCard from "@/components/courses/CourseCard";
import { apiServerGet } from "@/lib/server-api";

async function CourseList() {
  const { data: courses } = await apiServerGet("/courses?limit=100");

  if (courses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#c9c5e8] bg-white p-10 text-center">
        <h2 className="text-lg font-semibold text-[#29245e]">
          No Courses Available Yet
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Courses and their subjects will appear here once they are added.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}

function CourseListFallback() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {[1, 2].map((item) => (
        <div
          key={item}
          className="h-56 animate-pulse rounded-2xl border border-[#e2defa] bg-white"
        />
      ))}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-[#f8f9ff] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#211d50] sm:text-4xl">
            Explore Your Courses
          </h1>

          <p className="mt-3 text-gray-600">
            Select your course to discover available subjects and study
            resources.
          </p>
        </div>

        <Suspense fallback={<CourseListFallback />}>
          <CourseList />
        </Suspense>
      </div>
    </main>
  );
}
