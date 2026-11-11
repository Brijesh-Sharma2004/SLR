export default function SearchBar() {
  return (
    <section className="mx-auto mt-10 w-full max-w-4xl px-4">
      <form
        action="/search"
        method="get"
        className="flex items-center gap-3 rounded-full border-2 border-[#d7dafa] bg-white p-2"
      >
        {/* Search Icon */}
        <span className="pl-3 text-2xl text-[#6666ff]">⌕</span>

        {/* Search Input */}
        <input
          type="search"
          name="q"
          placeholder="Search courses, subject, notes, question papers..."
          className="min-w-0 flex-1 bg-transparent py-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 sm:text-lg"
        />

        {/* Search Button */}
        <button
          type="submit"
          className="rounded-full bg-[#a3aaf5] px-6 py-3 text-sm text-white transition hover:bg-[#858ff0] sm:px-9 sm:text-base"
        >
          Search
        </button>
      </form>
    </section>
  );
}
