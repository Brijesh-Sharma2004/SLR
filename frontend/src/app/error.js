"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[#f8f9ff] px-6 text-center">
      <h1 className="text-5xl font-bold text-[#a3aaf5]">
        Something Went Wrong!
      </h1>

      <p className="mt-4 max-w-md text-gray-600">
        An unexpected error occurred. Please try again.
      </p>

      <button
        onClick={() => reset()}
        className="mt-7 rounded-full bg-[#a3aaf5] px-7 py-3 font-medium text-white transition hover:bg-[#858ff0]"
      >
        Try Again
      </button>
    </main>
  );
}
