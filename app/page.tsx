"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { KoboDevice, useKoboDevices } from "@/hooks/use-kobo-devices";
import { useSelectedBooks } from "@/store/selected-books";
import { useSelectedDevice } from "@/store/selected-device";
import { open } from "@tauri-apps/plugin-dialog";
import { AlertCircle, Info, Loader2, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function Home() {
  const { device, setDevice } = useSelectedDevice();
  const { clearAll } = useSelectedBooks();
  const router = useRouter();

  const { data: devices = [], isLoading, error, refetch } = useKoboDevices();

  const handleDeviceSelect = useCallback(
    (device: KoboDevice) => {
      setDevice(device);
      clearAll();
      router.push("/books");
    },
    [setDevice, clearAll, router]
  );

  const handleFileSelect = useCallback(async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "SQLite Database",
            extensions: ["sqlite", "db"],
          },
        ],
      });

      if (selected) {
        // Create a virtual device for the uploaded file
        const fileDevice: KoboDevice = {
          name: "Uploaded Database",
          path: selected as string,
          isFile: true, // Add this to KoboDevice type
        };
        handleDeviceSelect(fileDevice);
      }
    } catch (err) {
      console.error("Error selecting file:", err);
    }
  }, [handleDeviceSelect]);

  return (
    <div className="space-y-4">
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-xl font-semibold">Select your Kobo</h2>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {isLoading && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Scanning for Kobo devices...</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error scanning for devices. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && devices.length === 0 && (
        <Alert variant="warning">
          <Info className="h-4 w-4" />
          <AlertDescription>
            No Kobo devices found. Please connect your Kobo and try again.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && devices.length > 0 && (
        <div className="grid gap-4">
          {devices.map((d) => (
            <button
              key={d.path}
              className={`p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors
                ${device?.path === d.path ? "border-blue-500 bg-blue-50" : ""}`}
              onClick={() => handleDeviceSelect(d)}
            >
              <div className="font-medium">{d.name}</div>
              <div className="text-sm text-gray-600">{d.path}</div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 pt-4 border-t">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Import from SQLite</h3>
        </div>
        <Button
          variant="outline"
          className="w-full text-left flex items-center gap-2"
          onClick={handleFileSelect}
        >
          <Info className="h-4 w-4" />
          Load from SQLite file
          <span className="text-sm text-gray-500 ml-auto">
            Select KoboReader.sqlite file directly
          </span>
        </Button>
      </div>
    </div>
  );
}
