import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import ResourceCard from "@/components/resources/ResourceCard";
import { ApiError } from "@/lib/api-errors";
import { apiServerGet } from "@/lib/server-api";

async function SubjectContent({ params }) {
  const { subjectId } = await params;

  let subject;

  try {
    const response = await apiServerGet(
      `/subjects/${encodeURIComponent(subjectId)}`,
    );
    subject = response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  return (
    <>
      <Link
        href={`/courses/${subject.course.slug}`}
        className="mb-8 inline-flex text-sm font-medium text-[#737cff] hover:text-[#454cff]"
      >
        ← Back to {subject.course.name}
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#211d50] sm:text-4xl">
          {subject.name}
        </h1>

        <p className="mt-3 text-gray-600">Subject Code: {subject.code}</p>

        <p className="mt-2 text-gray-600">
          Explore notes, previous-year papers, and video lectures.
        </p>
      </div>

      <h2 className="mb-6 text-2xl font-bold text-[#29245e]">
        Learning Resources
      </h2>

      {subject.resources.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subject.resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#c9c5e8] bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-[#29245e]">
            No Resources Available Yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Learning materials for this subject will be added soon.
          </p>
        </div>
      )}
    </>
  );
}

function SubjectFallback() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-2/3 rounded bg-[#e2defa]" />
      <div className="h-5 w-1/2 rounded bg-[#e2defa]" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-48 rounded-2xl bg-white" />
        ))}
      </div>
    </div>
  );
}

export default function SubjectPage({ params }) {
  return (
    <main className="min-h-screen bg-[#f8f9ff] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Suspense fallback={<SubjectFallback />}>
          <SubjectContent params={params} />
        </Suspense>
      </div>
    </main>
  );
}
