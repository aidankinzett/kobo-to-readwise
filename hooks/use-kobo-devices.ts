import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export interface KoboDevice {
  name: string;
  path: string;
  isFile?: boolean;
}

/**
 * Fetches connected Kobo devices from the system
 */
const fetchKoboDevices = async (): Promise<KoboDevice[]> => {
  try {
    console.log("Fetching Kobo devices...");
    return await invoke<KoboDevice[]>("get_kobo_devices");
  } catch (error) {
    console.error("Failed to get devices:", error);
    throw error;
  }
};

export const useKoboDevices = () => {
  return useQuery({
    queryKey: ["koboDevices"],
    queryFn: fetchKoboDevices,
    retryDelay: 5000,
  });
};
