import Link from "next/link";

export default function LearningCards() {
  return (
    <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 px-4 py-16 md:grid-cols-2">
      {/* Start Learning Card */}
      <div className="rounded-3xl border border-[#e2defa] bg-[#efedff] p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
        <h2 className="text-2xl font-bold text-[#29245e]">
          Start Learning NOW!
        </h2>

        <p className="mt-4 leading-7 text-[#62617c]">
          Access quality study materials, notes, and learning resources to make
          your university preparation easier.
        </p>

        <Link
          href="/explore"
          className="mt-7 inline-block rounded-full bg-[#a3aaf5] px-6 py-3 font-medium text-white transition hover:bg-[#858ff0]"
        >
          Start Learning
        </Link>
      </div>

      {/* Explore Course Card */}
      <div className="rounded-3xl border border-[#e2defa] bg-[#efedff] p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
        <h2 className="text-2xl font-bold text-[#29245e]">
          Explore Your Course
        </h2>

        <p className="mt-4 leading-7 text-[#62617c]">
          Discover courses and subjects organized according to your university
          curriculum.
        </p>

        <Link
          href="/explore"
          className="mt-7 inline-block rounded-full bg-[#a3aaf5] px-6 py-3 font-medium text-white transition hover:bg-[#858ff0]"
        >
          Explore Courses
        </Link>
      </div>
    </section>
  );
}
