import { Progress } from "@/components/ui/progress";

interface UpdateToastProps {
  progress: number;
  version: string;
}

export function UpdateToast({ progress, version }: UpdateToastProps) {
  return (
    <div className="w-full">
      <p className="mb-2">Downloading version {version}</p>
      <Progress value={progress} className="w-full" />
      <p className="mt-1 text-sm text-muted-foreground">
        {progress.toFixed(0)}%
      </p>
    </div>
  );
}
