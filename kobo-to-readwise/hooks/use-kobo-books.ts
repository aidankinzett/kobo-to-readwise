import { KoboBook } from "@/store/selected-books";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export function useKoboBooks(devicePath: string | undefined) {
  return useQuery({
    queryKey: ["koboBooks", devicePath],
    queryFn: async () => {
      if (!devicePath) throw new Error("No device selected");
      return invoke<KoboBook[]>("get_kobo_books", { devicePath });
    },
    enabled: !!devicePath,
    retry: false,
  });
}
