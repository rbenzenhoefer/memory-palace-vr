import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchRoom, fetchRooms } from "@/lib/palace/palaceApi";

export const roomQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["room", slug],
    queryFn: () => fetchRoom(slug),
    enabled: !!slug,
    staleTime: 60_000,
  });

export const roomsQueryOptions = () =>
  queryOptions({ queryKey: ["rooms"], queryFn: fetchRooms, staleTime: 60_000 });

export function useRoom(slug: string) {
  return useQuery(roomQueryOptions(slug));
}

export function useRooms() {
  return useQuery(roomsQueryOptions());
}
