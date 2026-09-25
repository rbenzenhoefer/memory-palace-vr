import { useQuery } from "@tanstack/react-query";
import { fetchLocusObjects } from "@/lib/palace/palaceApi";

export function useLocusObjects(room: string) {
  return useQuery({
    queryKey: ["locus-objects", room],
    queryFn: () => fetchLocusObjects(room),
    staleTime: 60_000,
  });
}
