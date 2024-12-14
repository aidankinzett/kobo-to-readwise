"use client";

import { useUpdateChecker } from "@/hooks/use-update-checker";
import { Button } from "./ui/button";

export function UpdateChecker() {
  const { checkForUpdates } = useUpdateChecker();

  return <Button onClick={checkForUpdates}>Check for Updates</Button>;
}
