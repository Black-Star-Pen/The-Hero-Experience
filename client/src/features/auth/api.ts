import type {
  ChangePasswordInput,
  LoginInput,
  ProfileInput,
  RegisterInput,
  SessionResponse,
  User,
} from "@hero-experience/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api.ts";
import { reloadAt } from "../../lib/browser.ts";
import { bookingKeys } from "../bookings/api.ts";
import { heroKeys } from "../heroes/api.ts";

export const sessionKey = ["session"] as const;

/** The signed-in user, or null for visitors. */
export const useSession = () =>
  useQuery({
    queryKey: sessionKey,
    queryFn: async ({ signal }) =>
      (await api<SessionResponse>("/auth/session", { signal })).user,
    staleTime: 5 * 60_000,
  });

/** After sign-in, the data that depends on the visitor is stale. */
function useSessionChange() {
  const queryClient = useQueryClient();
  return (user: User) => {
    queryClient.setQueryData(sessionKey, user);
    queryClient.removeQueries({ queryKey: bookingKeys.all });
    void queryClient.invalidateQueries({ queryKey: heroKeys.all });
  };
}

export function useLogin() {
  const onSessionChange = useSessionChange();
  return useMutation({
    mutationFn: async (input: LoginInput) =>
      (
        await api<{ user: User }>("/auth/login", {
          method: "POST",
          body: input,
        })
      ).user,
    onSuccess: onSessionChange,
  });
}

export function useRegister() {
  const onSessionChange = useSessionChange();
  return useMutation({
    mutationFn: async (input: RegisterInput) =>
      (
        await api<{ user: User }>("/auth/register", {
          method: "POST",
          body: input,
        })
      ).user,
    onSuccess: onSessionChange,
  });
}

/**
 * Signs out, then reloads the home page. Nothing of the account stays in
 * memory, and a private page cannot send the new visitor to the sign-in page
 * before the home page is shown (the route change is rendered in a React
 * transition, after an update of the session).
 */
export const useLogout = () =>
  useMutation({
    mutationFn: () => api<void>("/auth/logout", { method: "POST" }),
    onSuccess: () => reloadAt("/"),
  });

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: ProfileInput) =>
      (await api<{ user: User }>("/me", { method: "PATCH", body: profile }))
        .user,
    onSuccess: (user) => queryClient.setQueryData(sessionKey, user),
  });
}

export const useChangePassword = () =>
  useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      api<void>("/me/password", { method: "PUT", body: input }),
  });
