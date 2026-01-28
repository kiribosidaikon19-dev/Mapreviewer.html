import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

async function fetchUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/user");
    if (response.status === 401) return null;
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  } catch (error) {
    return null;
  }
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (username: string) => {
      const res = await apiRequest("POST", "/api/login", { username });
      return res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/user"], user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
