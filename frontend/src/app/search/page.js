import { Suspense } from "react";
import Link from "next/link";

import CourseCard from "@/components/courses/CourseCard";
import SubjectCard from "@/components/subjects/SubjectCard";
import ResourceCard from "@/components/resources/ResourceCard";
import { apiServerGet } from "@/lib/server-api";

function ResultSection({ title, count, children }) {
  if (count === 0) {
    return null;
  }

  return (
    <section className="mt-10">
      <h2 className="mb-5 text-xl font-bold text-[#29245e]">
        {title} <span className="text-sm text-gray-500">({count})</span>
      </h2>

      {children}
    </section>
  );
}

async function SearchResults({ searchParams }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";

  if (!query) {
    return (
      <div className="rounded-2xl border border-dashed border-[#c9c5e8] bg-white p-10 text-center">
        <h2 className="text-lg font-semibold text-[#29245e]">
          Start Searching
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Enter a course, subject, notes, or question paper name to find
          resources.
        </p>
        <Link
          href="/explore"
          className="mt-6 inline-flex rounded-full bg-[#a3aaf5] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#858ff0]"
        >
          Explore Courses
        </Link>
      </div>
    );
  }

  const response = await apiServerGet(
    `/search?q=${encodeURIComponent(query)}&limit=20`,
  );

  const { courses, subjects, resources } = response.data;
  const total = response.meta.total;

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#c9c5e8] bg-white p-10 text-center">
        <h2 className="text-lg font-semibold text-[#29245e]">
          No Results Found
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Nothing matched “{query}”. Try a different course, subject, or
          resource name.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500">
        Showing {total} result{total === 1 ? "" : "s"} for “{query}”.
      </p>

      <ResultSection title="Courses" count={courses.length}>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </ResultSection>

      <ResultSection title="Subjects" count={subjects.length}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      </ResultSection>

      <ResultSection title="Resources" count={resources.length}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </ResultSection>
    </div>
  );
}

function SearchFallback() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-5 w-52 rounded bg-[#e2defa]" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-44 rounded-2xl bg-white" />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage({ searchParams }) {
  return (
    <main className="min-h-screen bg-[#f8f9ff] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-8 inline-flex text-sm font-medium text-[#737cff] hover:text-[#454cff]"
        >
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-[#211d50] sm:text-4xl">
          Search Results
        </h1>

        <div className="mt-8">
          <Suspense fallback={<SearchFallback />}>
            <SearchResults searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
