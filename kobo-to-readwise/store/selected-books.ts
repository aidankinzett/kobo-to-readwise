import { create } from "zustand";

export interface KoboBook {
  title: string;
  author: string;
  book_id: string;
  highlight_count: number;
  source: "Kobo Store" | "Sideloaded";
}

interface SelectedBooksState {
  selectedBooks: Set<string>;
  toggleBook: (bookId: string) => void;
  selectAll: (bookIds: string[]) => void;
  clearAll: () => void;
}

export const useSelectedBooks = create<SelectedBooksState>((set) => ({
  selectedBooks: new Set<string>(),
  toggleBook: (bookId: string) =>
    set((state) => {
      const newSelected = new Set(state.selectedBooks);
      if (newSelected.has(bookId)) {
        newSelected.delete(bookId);
      } else {
        newSelected.add(bookId);
      }
      return { selectedBooks: newSelected };
    }),
  selectAll: (bookIds: string[]) =>
    set(() => ({ selectedBooks: new Set(bookIds) })),
  clearAll: () => set(() => ({ selectedBooks: new Set() })),
}));
