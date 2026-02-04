import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertLocation } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

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
      const res = await fetch(api.locations.create.path, {
        method: api.locations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

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
    onError: (error) => {
      console.error("Location creation error:", error);
      toast({
        title: "作成失敗",
        description: error.message || "場所の作成に失敗しました。入力内容を確認してください。",
        variant: "destructive",
      });
    },
  });
}
