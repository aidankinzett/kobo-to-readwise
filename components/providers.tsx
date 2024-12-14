"use client";

import { useUpdateChecker } from "@/hooks/use-update-checker";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useEffect, useState } from "react";

export function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());

  const { checkForUpdates } = useUpdateChecker();

  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
