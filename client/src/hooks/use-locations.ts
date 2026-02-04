import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Location, type InsertLocation } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function useLocations() {
  return useQuery({
    queryKey: [api.locations.list.path],
    queryFn: async () => {
      const res = await fetch(api.locations.list.path);
      if (!res.ok) throw new Error("Failed to fetch locations");
      return api.locations.list.responses[200].parse(await res.json());
    },
  });
}

export function useLocation(id: number | null) {
  return useQuery({
    queryKey: [api.locations.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("ID required");
      const url = buildUrl(api.locations.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch location details");
      }
      return api.locations.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertLocation) => {
      const res = await apiRequest("POST", api.locations.create.path, data);
      if (!res.ok) {
        if (res.status === 401) throw new Error("Please log in to add a location");
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create location");
      }
      return api.locations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.locations.list.path] });
      toast({
        title: "作成成功",
        description: "新しい場所が地図に追加されました。",
      });
    },
    onError: (error: Error) => {
      console.error("Location creation error:", error);
      toast({
        title: "作成失敗",
        description: error.message || "場所の作成に失敗しました。入力内容を確認してください。",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteLocation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/locations/${id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete location");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.locations.list.path] });
      toast({
        title: "削除成功",
        description: "場所を削除しました。",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "削除失敗",
        description: error.message || "場所の削除に失敗しました。",
        variant: "destructive",
      });
    },
  });
}
