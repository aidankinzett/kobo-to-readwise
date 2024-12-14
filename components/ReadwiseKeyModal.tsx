"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettings } from "@/store/settings";
import Link from "next/link";

export function ReadwiseKeyModal() {
  const { readwiseApiKey } = useSettings();

  // Only show if there's no token
  const showModal = !readwiseApiKey;

  return (
    <Dialog open={showModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Readwise API Key Required</DialogTitle>
          <DialogDescription className="space-y-4 pt-3">
            <p>
              To sync your highlights with Readwise, you&apos;ll need to add
              your API key in the settings.
            </p>
            <p>
              You can find your API key at{" "}
              <a
                href="https://readwise.io/access_token"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                readwise.io/access_token
              </a>
            </p>
            <div className="pt-4">
              <Link href="/settings">
                <Button className="w-full">Go to Settings</Button>
              </Link>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
