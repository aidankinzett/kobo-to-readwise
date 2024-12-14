import { UpdateToast } from "@/components/ui/UpdateToast";
import { useToast } from "@/hooks/use-toast";
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";
import { useCallback } from "react";

export type UpdateStatus = {
  available: boolean;
  version?: string;
  notes?: string;
  downloading: boolean;
  progress?: number;
};

/**
 * Hook for checking and installing application updates with toast notifications
 * @returns Object containing update status and check function
 */
export function useUpdateChecker() {
  const { toast } = useToast();

  const checkForUpdates = useCallback(async () => {
    try {
      const update = await check();

      if (update) {
        console.log(
          `found update ${update.version} from ${update.date} with notes ${update.body}`
        );

        const updateToast = toast({
          title: "Update Available",
          description: <UpdateToast progress={0} version={update.version} />,
          duration: Infinity, // Keep the toast visible until download completes
        });

        let downloaded = 0;
        let contentLength = 0;

        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case "Started":
              contentLength = event.data.contentLength ?? 0;
              console.log(
                `started downloading ${event.data.contentLength} bytes`
              );
              break;
            case "Progress":
              downloaded += event.data.chunkLength;
              const progress = (downloaded / contentLength) * 100;
              console.log(`downloaded ${downloaded} from ${contentLength}`);

              updateToast.update({
                id: updateToast.id,
                title: "Downloading Update",
                description: (
                  <UpdateToast progress={progress} version={update.version} />
                ),
                duration: Infinity,
              });
              break;
            case "Finished":
              console.log("download finished");
              updateToast.update({
                id: updateToast.id,
                title: "Update Downloaded",
                description: "Restarting application to install update...",
              });
              break;
          }
        });

        console.log("update installed");
        await relaunch();

        return {
          available: true,
          version: update.version,
          notes: update.body,
          downloading: false,
        };
      }

      toast({
        title: "No Updates Available",
        description: "You're running the latest version.",
      });

      return { available: false, downloading: false };
    } catch (error) {
      console.error("Error checking for updates:", error);
      toast({
        title: "Update Error",
        description: "Failed to check for updates",
        variant: "destructive",
      });
      return { available: false, downloading: false };
    }
  }, [toast]);

  return {
    checkForUpdates,
  };
}
