"use client";

import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { useReadwise } from "@/hooks/use-readwise";
import { useSelectedBooks } from "@/store/selected-books";
import { useSelectedDevice } from "@/store/selected-device";
import { invoke } from "@tauri-apps/api/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface KoboHighlight {
  text: string;
  title: string;
  author: string;
  note: string | null;
  date: string;
  location: number | null;
}

export default function ExportPage() {
  const { device } = useSelectedDevice();
  const { selectedBooks } = useSelectedBooks();
  const router = useRouter();
  const { highlightsMutation } = useReadwise();
  const [isExporting, setIsExporting] = useState(false);

  if (!device) {
    router.push("/");
    return null;
  }

  if (selectedBooks.size === 0) {
    router.push("/books");
    return null;
  }

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Fetch all highlights in a single call
      const allHighlights: KoboHighlight[] = await invoke<KoboHighlight[]>(
        "get_book_highlights",
        {
          devicePath: device.path,
          bookIds: Array.from(selectedBooks),
        }
      );

      // Convert to Readwise format
      const readwiseHighlights = allHighlights.map((highlight) => ({
        text: highlight.text,
        title: highlight.title,
        author: highlight.author,
        note: highlight.note || undefined,
        highlighted_at: new Date(highlight.date).toISOString(),
        location: highlight.location || undefined, // TODO: if no location is provided the API will throw an error
        source_type: "kobo_to_readwise",
        category: "books" as const,
      }));

      console.log(JSON.stringify(readwiseHighlights, null, 2));

      // Send to Readwise
      await highlightsMutation.mutateAsync(readwiseHighlights);

      // Redirect to success page or show success message
      router.push("/");
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-2xl font-bold">Export to Readwise</h1>
      </div>

      <div className="p-4 border rounded-lg space-y-4">
        <p>Ready to export {selectedBooks.size} books to Readwise.</p>
        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? "Exporting..." : "Export to Readwise"}
        </Button>
      </div>
    </div>
  );
}
