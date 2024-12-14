import { useProcessAnnotations } from "@/hooks/use-process-annotations";
import { useProcessDatabase } from "@/hooks/use-process-database";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { saveAs } from "file-saver";

interface ProcessHighlightsInput {
  dbFile: File;
  annotFiles: FileList | null;
}

export const useProcessHighlights = () => {
  const { processDatabase } = useProcessDatabase();
  const { processAnnotationFile } = useProcessAnnotations();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ dbFile, annotFiles }: ProcessHighlightsInput) => {
      const dbEntries = await processDatabase(dbFile);
      const annotationResults = await Promise.all(
        Array.from(annotFiles || []).map(processAnnotationFile)
      );

      const annotationFileBookIds = annotationResults.map((r) => r.bookId);
      const annotationFileEntries = annotationResults.flatMap((r) => r.entries);

      const output: string[] = [];
      output.push(
        ["Highlight", "Title", "Author", "Note", "Date", "Location"].join(",")
      );

      dbEntries.forEach((entry) => {
        if (!annotationFileBookIds.includes(entry.bookId)) {
          output.push(entry.row);
        }
      });

      annotationFileEntries.forEach((entry) => {
        output.push(entry.join(","));
      });

      const blob = new Blob([output.join("\n")], {
        type: "text/csv;charset=utf-8",
      });
      saveAs(blob, "kobo-highlights.csv");
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description:
          "Your highlights have been exported to kobo-highlights.csv",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    },
  });
};
