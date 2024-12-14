"use client";

import { BackButton } from "@/components/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { useKoboBooks } from "@/hooks/use-kobo-books";
import { useSelectedBooks } from "@/store/selected-books";
import { useSelectedDevice } from "@/store/selected-device";
import { AutoSelectOption, useSettings } from "@/store/settings";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BooksPage() {
  const { device } = useSelectedDevice();
  const router = useRouter();
  const { data: books, isLoading, error } = useKoboBooks(device?.path);
  const { selectedBooks, toggleBook, selectAll, clearAll } = useSelectedBooks();
  const { autoSelect, readwiseApiKey } = useSettings();

  useEffect(() => {
    if (!books) return;

    switch (autoSelect) {
      case AutoSelectOption.All:
        selectAll(books.map((book) => book.book_id));
        break;
      case AutoSelectOption.Sideloaded:
        const sideloadedBookIds = books
          .filter((book) => book.source === "Sideloaded")
          .map((book) => book.book_id);
        selectAll(sideloadedBookIds);
        break;
      case AutoSelectOption.None:
      default:
        // Don't auto-select any books
        break;
    }
  }, [books, selectAll, autoSelect]);

  if (!device) {
    router.push("/");
    return null;
  }

  if (isLoading) {
    return <div>Loading books...</div>;
  }

  if (error) {
    console.error(error);
    return (
      <div className="p-4 border rounded-lg bg-red-50">
        <p>Error loading books. Please try again.</p>
      </div>
    );
  }

  const handleSelectAll = () => {
    if (books) {
      if (selectedBooks.size === books.length) {
        clearAll();
      } else {
        selectAll(books.map((book) => book.book_id));
      }
    }
  };

  const handleContinue = () => {
    if (selectedBooks.size > 0) {
      router.push("/export");
    }
  };

  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case "Sideloaded":
        return "secondary";
      case "Kobo Store":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-2xl font-bold">Select Books to Export</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/settings")}>
            Settings
          </Button>
          <Button variant="outline" onClick={handleSelectAll}>
            {books && selectedBooks.size === books.length
              ? "Deselect All"
              : "Select All"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {books?.map((book) => (
          <div
            key={book.book_id}
            className="p-4 border rounded-lg flex items-center gap-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => toggleBook(book.book_id)}
          >
            <Checkbox
              checked={selectedBooks.has(book.book_id)}
              onCheckedChange={() => {
                toggleBook(book.book_id);
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
            <div className="flex-grow">
              <div className="font-medium">{book.title}</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{book.author}</span>
                <Badge variant={getSourceBadgeVariant(book.source)}>
                  {book.source}
                </Badge>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {book.highlight_count}{" "}
              {book.highlight_count === 1 ? "highlight" : "highlights"}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        {readwiseApiKey ? (
          <Button onClick={handleContinue} disabled={selectedBooks.size === 0}>
            Continue to Export
          </Button>
        ) : (
          <Button onClick={() => router.push("/settings")}>Set API Key</Button>
        )}
      </div>
    </div>
  );
}
