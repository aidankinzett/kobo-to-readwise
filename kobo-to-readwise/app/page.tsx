import { InstructionsCard } from "@/components/instructions-card";
import { KoboHighlightExtractor } from "@/components/kobo-highlight-extractor";
import { RequiredFilesCard } from "@/components/required-files-card";

export default function Home() {
  return (
    <main className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Kobo Highlights Extractor</h1>

      <div className="mb-8 space-y-4">
        <RequiredFilesCard />
        <InstructionsCard />
        <KoboHighlightExtractor />
      </div>
    </main>
  );
}
