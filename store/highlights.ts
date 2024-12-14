import { create } from "zustand";

interface HighlightsState {
  dbFile: File | null;
  annotFiles: FileList | null;
  processing: boolean;
  error: string | null;
  setDbFile: (file: File | null) => void;
  setAnnotFiles: (files: FileList | null) => void;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
}

export const useHighlightsStore = create<HighlightsState>((set) => ({
  dbFile: null,
  annotFiles: null,
  processing: false,
  error: null,
  setDbFile: (file) => set({ dbFile: file }),
  setAnnotFiles: (files) => set({ annotFiles: files }),
  setProcessing: (processing) => set({ processing }),
  setError: (error) => set({ error }),
}));
