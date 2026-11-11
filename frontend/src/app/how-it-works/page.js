import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  FileText,
  PlayCircle,
  ArrowRight,
  Search,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: GraduationCap,
    title: "Explore Your Course",
    description:
      "Browse the available university courses and select the course you are currently studying.",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Choose Your Subject",
    description:
      "Explore the subjects available under your selected course and find the subject you need.",
  },
  {
    number: "03",
    icon: Search,
    title: "Discover Learning Resources",
    description:
      "Browse organized study materials, notes, previous-year question papers, and video lectures.",
  },
  {
    number: "04",
    icon: FileText,
    title: "Learn and Prepare",
    description:
      "View or download PDF materials and access useful video lectures to support your preparation.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#f8f9ff] px-6 py-16">
      <section className="mx-auto max-w-6xl">
        {/* Page Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="rounded-full bg-[#efedff] px-5 py-2 text-sm font-semibold text-[#737cff]">
            HOW IT WORKS
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#211d50] sm:text-5xl">
            Start Learning in Just Four Simple Steps
          </h1>

          <p className="mt-5 text-base leading-7 text-gray-600 sm:text-lg">
            Smart Learning Resource brings your academic materials together in
            one place. Follow these simple steps to find the resources you need.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="rounded-2xl border border-[#e2defa] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#efedff] text-[#737cff]">
                    <Icon size={28} />
                  </div>

                  <span className="text-3xl font-bold text-[#e2defa]">
                    {step.number}
                  </span>
                </div>

                <h2 className="mt-7 text-xl font-bold text-[#29245e]">
                  {step.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-16 rounded-3xl bg-[#a5acf3] px-6 py-12 text-center sm:px-12">
          <h2 className="text-3xl font-bold text-white">
            Ready to Start Learning?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-white/90">
            Explore your courses and discover useful resources for your academic
            journey.
          </p>

          <Link
            href="/explore"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 font-semibold text-[#454cff] transition hover:-translate-y-1 hover:shadow-lg"
          >
            Explore Courses
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
