'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { checkForUpdates } from '@/lib/updates';
import { useState } from 'react';

export function UpdateChecker() {
  const [checking, setChecking] = useState(false);
  const { toast } = useToast();

  const handleCheckUpdate = async () => {
    setChecking(true);
    try {
      const status = await checkForUpdates();
      if (!status.available) {
        toast({
          title: "You're up to date!",
          description: "You're running the latest version.",
        });
      }
      // Note: If an update is available, the app will automatically restart
    } catch (error) {
      toast({
        title: "Error checking for updates",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckUpdate} 
      disabled={checking}
    >
      {checking ? "Checking..." : "Check for Updates"}
    </Button>
  );
} 