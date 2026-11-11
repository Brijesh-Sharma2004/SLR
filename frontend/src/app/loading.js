export default function Loading() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[#f8f9ff] px-6 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#e2defa] border-t-[#737cff]"></div>

      <h2 className="mt-6 text-xl font-semibold text-[#211d50]">Loading...</h2>

      <p className="mt-2 text-sm text-gray-500">
        Please wait while we prepare your learning resources.
      </p>
    </main>
  );
}
