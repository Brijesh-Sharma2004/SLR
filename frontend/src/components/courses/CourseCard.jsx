import Link from "next/link";

export default function CourseCard({ course }) {
  return (
    <div className="rounded-2xl border border-[#e2defa] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <h2 className="text-xl font-bold text-[#29245e]">{course.name}</h2>

      <p className="mt-3 text-sm leading-6 text-gray-600">
        {course.description}
      </p>

      <div className="mt-4 text-sm text-gray-500">
        Duration: {course.duration}
      </div>

      <Link
        href={`/courses/${course.slug || course.id}`}
        className="mt-6 inline-flex items-center rounded-full bg-[#a3aaf5] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#858ff0]"
      >
        View Subjects →
      </Link>
    </div>
  );
}
