"use client";

import { BackButton } from "@/components/back-button";
import { useSelectedBooks } from "@/store/selected-books";
import { useSelectedDevice } from "@/store/selected-device";
import { useRouter } from "next/navigation";

export default function ExportPage() {
  const { device } = useSelectedDevice();
  const { selectedBooks } = useSelectedBooks();
  const router = useRouter();

  if (!device) {
    router.push("/");
    return null;
  }

  if (selectedBooks.size === 0) {
    router.push("/books");
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-2xl font-bold">Export to Readwise</h1>
      </div>

      <div className="p-4 border rounded-lg">
        <p>Ready to export {selectedBooks.size} books to Readwise.</p>
        <p className="text-gray-600">Export functionality coming soon...</p>
      </div>
    </div>
  );
}
