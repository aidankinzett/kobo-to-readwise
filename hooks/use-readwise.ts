import { useSettings } from "@/store/settings";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { sumBy } from "lodash";
import { useMemo } from "react";
import { useToast } from "./use-toast";

interface ReadwiseHighlight {
  /**
   * The highlight text. The only required field in a highlight object.
   * Maximum length: 8191 characters
   */
  text: string;

  /**
   * Title of the book/article/podcast (the "source")
   * Maximum length: 511 characters
   */
  title?: string;

  /**
   * Author of the book/article/podcast (the "source")
   * Maximum length: 1024 characters
   */
  author?: string;

  /**
   * The url of a cover image for this book/article/podcast (the "source")
   * Maximum length: 2047 characters
   */
  image_url?: string;

  /**
   * The url of the article/podcast (the "source")
   * Maximum length: 2047 characters
   */
  source_url?: string;

  /**
   * A meaningful unique identifier for your app (string between 3 and 64 chars, no spaces).
   * Example: `my_app`
   * Note: for legacy integrations book/article/podcast can also be passed here,
   * but it is not recommended anymore.
   * Maximum length: 64 characters
   */
  source_type?: string;

  /**
   * One of: `books`, `articles`, `tweets` or `podcasts`.
   * This will determine where the highlight shows in the user's dashboard
   * and some aspects of how we render it.
   * If category is not provided we will assume that the category is either
   * `articles` (if source_url is provided) or (otherwise) a `books`.
   */
  category?: "books" | "articles" | "tweets" | "podcasts";

  /**
   * Annotation note attached to the specific highlight.
   * You can also use this field to create tags thanks to our inline tagging functionality.
   * Maximum length: 8191 characters
   */
  note?: string;

  /**
   * Highlight's location in the source text. Used to order the highlights.
   * If not provided we will fill this based on the order of highlights in the list.
   * If location_type is "time_offset", we interpret the integer as number of
   * seconds that elapsed from the start of the recording.
   */
  location?: number;

  /**
   * One of: `page`, `order` or `time_offset`
   * Default is `order`. If provided type is different than "order",
   * make sure to provide location as well.
   */
  location_type?: "page" | "order" | "time_offset";

  /**
   * A datetime representing when the highlight was taken in the ISO 8601 format;
   * default timezone is UTC.
   * Example: "2020-07-14T20:11:24+00:00"
   */
  highlighted_at?: string;

  /**
   * Unique url of the specific highlight (eg. a concrete tweet or a podcast snippet)
   * Maximum length: 4095 characters
   */
  highlight_url?: string;
}

interface ReadwiseHighlightResponse {
  id: number;
  title: string;
  author: string;
  category: string;
  source: string;
  num_highlights: number;
  last_highlight_at: string | null;
  updated: string;
  cover_image_url: string;
  highlights_url: string;
  source_url: string | null;
  modified_highlights: number[];
}

export const useReadwise = () => {
  const { readwiseApiKey } = useSettings();

  const client = useMemo(() => {
    if (!readwiseApiKey || readwiseApiKey.length === 0) return null;

    // set up axios client
    const axiosInstance = axios.create({
      baseURL: "https://readwise.io/api",
      headers: {
        Authorization: `Token ${readwiseApiKey}`,
      },
    });

    return axiosInstance;
  }, [readwiseApiKey]);

  const testAuthQuery = useQuery({
    queryKey: ["auth", readwiseApiKey],
    queryFn: () => client?.get("/v2/auth/"),
    retry: false,
    enabled: !!client,
  });

  const { toast } = useToast();

  const highlightsMutation = useMutation({
    mutationFn: async (highlights: ReadwiseHighlight[]) => {
      if (!client) throw new Error("Client not initialized");
      return client.post<ReadwiseHighlightResponse[]>("/v2/highlights/", {
        highlights,
      });
    },
    onSuccess: (data) => {
      const numHighlights = sumBy(
        data.data,
        (book) => book.modified_highlights.length,
      );

      if (numHighlights === 0) {
        toast({
          title: "No highlights were added",
          variant: "default",
        });
        return;
      }

      toast({
        title: `${numHighlights} highlights added successfully`,
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add highlights",
        variant: "destructive",
      });
    },
  });

  return { client, testAuthQuery, highlightsMutation };
};
