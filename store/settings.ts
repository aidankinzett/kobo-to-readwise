import { appConfigDir } from "@tauri-apps/api/path";
import { load } from "@tauri-apps/plugin-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export enum AutoSelectOption {
  None = "None",
  All = "All",
  Sideloaded = "Sideloaded",
}

interface Settings {
  autoSelect: AutoSelectOption;
  readwiseApiKey: string;
  setAutoSelect: (value: AutoSelectOption) => void;
  setReadwiseApiKey: (value: string) => void;
}

const SETTINGS_FILE = "settings.json";

export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      autoSelect: AutoSelectOption.Sideloaded,
      readwiseApiKey: "",
      setAutoSelect: (value) => set({ autoSelect: value }),
      setReadwiseApiKey: (value) => set({ readwiseApiKey: value }),
    }),
    {
      name: "settings",
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          const store = await load(`${await appConfigDir()}/${SETTINGS_FILE}`);
          const value = await store.get<string>(name);
          return value ?? null;
        },
        setItem: async (name, value) => {
          const store = await load(`${await appConfigDir()}/${SETTINGS_FILE}`);
          await store.set(name, value);
          await store.save();
        },
        removeItem: async (name: string) => {
          const store = await load(`${await appConfigDir()}/${SETTINGS_FILE}`);
          await store.delete(name);
          await store.save();
        },
      })),
    }
  )
);
