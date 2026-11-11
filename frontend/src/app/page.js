import HeroSection from "@/components/home/HeroSection";
import SearchBar from "@/components/home/SearchBar";
import LearningCards from "@/components/home/LearningCards";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f8f9ff]">
      <HeroSection />
      <SearchBar />
      <LearningCards />
    </main>
  );
}
