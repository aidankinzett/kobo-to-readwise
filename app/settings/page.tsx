"use client";

import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UpdateChecker } from "@/components/UpdateChecker";
import { useReadwise } from "@/hooks/use-readwise";
import { cn } from "@/lib/utils";
import { AutoSelectOption, useSettings } from "@/store/settings";
import { open } from "@tauri-apps/plugin-shell";
import { CheckCircle, ExternalLink, Loader2, XCircle } from "lucide-react";

export default function SettingsPage() {
  const { autoSelect, setAutoSelect, readwiseApiKey, setReadwiseApiKey } =
    useSettings();

  const openReadwiseTokenPage = async () => {
    await open("https://readwise.io/access_token");
  };

  const { testAuthQuery } = useReadwise();

  const { isSuccess, isError, isLoading } = testAuthQuery;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Readwise API Key</label>
          <div className="flex items-center justify-between">
            <Input
              type="password"
              value={readwiseApiKey}
              onChange={(e) => {
                setReadwiseApiKey(e.target.value);
              }}
              placeholder="Enter your Readwise API key"
              className="max-w-md"
            />

            {/* show a loading indicator if testing the api key */}
            {isLoading && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p>Testing API key...</p>
              </div>
            )}

            {/* show indicator  */}
            {(isSuccess || isError) && (
              <div
                className={cn(
                  "flex items-center gap-2",
                  isSuccess ? "text-green-500" : "text-red-500",
                )}
              >
                {isSuccess ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <p>{isSuccess ? "API key is valid" : "API key is invalid"}</p>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Your Readwise API key is required to sync highlights.
          </p>
          <Button onClick={openReadwiseTokenPage}>
            Get API Key <ExternalLink className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Auto-select Books</label>
          <Select
            value={autoSelect}
            onValueChange={(value: string) =>
              setAutoSelect(value as AutoSelectOption)
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select auto-select behavior" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AutoSelectOption.None}>None</SelectItem>
              <SelectItem value={AutoSelectOption.All}>All Books</SelectItem>
              <SelectItem value={AutoSelectOption.Sideloaded}>
                Sideloaded Books
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500">
            Choose which books should be automatically selected when viewing the
            books page.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Updates</h2>
          <UpdateChecker />
        </div>
      </div>
    </div>
  );
}
