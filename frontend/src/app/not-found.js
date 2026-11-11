import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[#f8f9ff] px-6 text-center">
      <h1 className="text-7xl font-bold text-[#a3aaf5]">404</h1>

      <h2 className="mt-4 text-2xl font-bold text-[#211d50]">Page Not Found</h2>

      <p className="mt-3 max-w-md text-gray-600">
        Sorry, the page you are looking for does not exist or may have been
        moved.
      </p>

      <Link
        href="/"
        className="mt-7 rounded-full bg-[#a3aaf5] px-7 py-3 font-medium text-white transition hover:bg-[#858ff0]"
      >
        Back to Home
      </Link>
    </main>
  );
}
