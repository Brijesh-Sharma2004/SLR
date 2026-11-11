import Link from "next/link";

export default function ResourceCard({ resource }) {
  const isPDF = resource.type === "PDF";

  return (
    <div className="rounded-2xl border border-[#e2defa] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-[#efedff] px-3 py-1 text-sm font-medium text-[#737cff]">
          {resource.type}
        </span>
      </div>

      <h2 className="text-lg font-bold text-[#29245e]">{resource.title}</h2>

      <p className="mt-2 text-sm leading-6 text-gray-600">
        {resource.description}
      </p>

      {resource.subject && (
        <Link
          href={`/subjects/${resource.subject.slug || resource.subject.id}`}
          className="mt-3 inline-block text-sm font-medium text-[#737cff] hover:text-[#454cff]"
        >
          {resource.subject.name} ({resource.subject.code})
        </Link>
      )}

      <div className="mt-6">
        {isPDF ? (
          <div className="flex gap-3">
            <Link
              href={resource.url}
              target="_blank"
              className="rounded-full bg-[#a3aaf5] px-4 py-2 text-sm font-medium text-white hover:bg-[#858ff0]"
            >
              View PDF
            </Link>

            <a
              href={resource.url}
              download
              className="rounded-full border border-[#a3aaf5] px-4 py-2 text-sm font-medium text-[#737cff] hover:bg-[#efedff]"
            >
              Download
            </a>
          </div>
        ) : (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full bg-[#a3aaf5] px-4 py-2 text-sm font-medium text-white hover:bg-[#858ff0]"
          >
            Watch Lecture →
          </a>
        )}
      </div>
    </div>
  );
}
