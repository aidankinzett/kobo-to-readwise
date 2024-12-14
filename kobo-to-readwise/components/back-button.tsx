"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export const BackButton = () => {
  const router = useRouter();
  return (
    <Button variant="outline" onClick={() => router.back()} className="mr-2">
      <ArrowLeft className="w-4 h-4" />
      Back
    </Button>
  );
};
