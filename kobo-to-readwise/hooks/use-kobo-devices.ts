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
    // poll every second to check if devices are connected
    refetchInterval: 5000,
    // dont constantly retry if we fail to get devices
    retryDelay: 5000,
    // stop polling when we have devices
    enabled: (query) => (query.state.data?.length ?? 0) === 0,
    // don't retry if we fail to get devices
    retry: false,
  });
};
