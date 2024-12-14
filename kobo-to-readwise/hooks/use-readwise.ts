import { useSettings } from "@/store/settings";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";

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

  return { client, testAuthQuery };
};
