import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";

export const useKoboDevice = () => {
  const {
    data: koboPath,
    error,
    isError,
  } = useQuery({
    queryKey: ["koboDevice"],
    queryFn: async () => {
      try {
        console.log("Invoking find_kobo_device");
        const path = await invoke<string>("find_kobo_device");
        console.log("Kobo device found at:", path);
        return path;
      } catch (err) {
        console.error("Error finding Kobo device:", err);
        throw err;
      }
    },
    refetchInterval: 1000,
  });

  const selectKoboFile = async () => {
    try {
      const selected = await open({
        filters: [
          {
            name: "Kobo Database",
            extensions: ["sqlite"],
          },
        ],
      });

      if (selected) {
        console.log("Selected file:", selected);
        const contents = await readFile(selected);
        return new File([contents], "KoboReader.sqlite", {
          type: "application/x-sqlite3",
        });
      }
    } catch (err) {
      console.error("Error selecting file:", err);
      throw err;
    }
  };

  return {
    koboPath,
    error,
    isError,
    selectKoboFile,
  };
};
