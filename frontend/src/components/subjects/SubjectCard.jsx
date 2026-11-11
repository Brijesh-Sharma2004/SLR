import Link from "next/link";

export default function SubjectCard({ subject }) {
  return (
    <div className="rounded-2xl border border-[#e2defa] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#efedff] text-lg font-bold text-[#737cff]">
        {subject.code.slice(-3)}
      </div>

      <h2 className="text-lg font-bold text-[#29245e]">{subject.name}</h2>

      <p className="mt-2 text-sm text-gray-500">Subject Code: {subject.code}</p>

      <Link
        href={`/subjects/${subject.slug || subject.id}`}
        className="mt-5 inline-flex items-center font-medium text-[#737cff] transition hover:text-[#454cff]"
      >
        View Resources →
      </Link>
    </div>
  );
}
