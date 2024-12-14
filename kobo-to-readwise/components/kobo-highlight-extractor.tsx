"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProcessHighlights } from "@/hooks/use-process-highlights";
import { useHighlightsStore } from "@/store/highlights";
import { ChangeEvent } from "react";

export function KoboHighlightExtractor() {
  const { dbFile, annotFiles, setDbFile, setAnnotFiles } = useHighlightsStore();
  const { mutate: processHighlights, isPending } = useProcessHighlights();

  const handleProcess = () => {
    if (!dbFile) return;

    processHighlights({ dbFile, annotFiles });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extract Highlights</CardTitle>
        <CardDescription>
          Upload your files to extract the highlights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="sqlite-file">KoboReader.sqlite file</Label>
            <Input
              id="sqlite-file"
              type="file"
              accept=".sqlite"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setDbFile(e.target.files?.[0] || null);
              }}
              className="cursor-pointer w-full"
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="annot-input">Annotation files (optional)</Label>
            <Input
              id="annot-input"
              type="file"
              accept=".annot"
              multiple
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setAnnotFiles(e.target.files);
              }}
              className="cursor-pointer w-full"
            />
          </div>

          <Button
            onClick={handleProcess}
            disabled={!dbFile || isPending}
            className="w-full"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Processing...</span>
              </div>
            ) : (
              "Process Files"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
