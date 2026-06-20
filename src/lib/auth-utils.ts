import type { User } from "@supabase/supabase-js";
import type { UserRole, UserState } from "@/lib/store";

/** Infer portal role from email — matches shop page logic. */
export function inferRoleFromEmail(email: string): UserRole {
  const normalized = email.toLowerCase();
  if (normalized.includes("admin")) return "admin";
  if (normalized.includes("staff")) return "staff";
  if (normalized.includes("rider")) return "rider";
  return "customer";
}

export function getRedirectForRole(role: UserRole): string {
  console.log("role", role);
  switch (role) {
    case "admin":
    case "staff":
      return "/staff";
    case "rider":
      return "/rider";
    default:
      return "/";
  }
}

export function getInitials(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (email[0] ?? "?").toUpperCase();
}

/** Map Redux role to staff portal view role. */
export function mapStaffPortalRole(
  role: UserRole,
): "admin" | "store-manager" | "dispatch" {
  if (role === "admin") return "admin";
  if (role === "staff") return "store-manager";
  return "dispatch";
}

export function canAccessStaffPortal(role: UserRole): boolean {
  return role === "admin" || role === "staff";
}

export function canAccessRiderPortal(role: UserRole): boolean {
  return role === "rider" || role === "admin";
}

export function buildUserStateFromAuth(
  user: User,
  profile?: {
    name: string;
    email: string;
    role: string;
    store_id?: string | null;
    phone?: string | null;
    delivery_address?: string | null;
    location?: string | null;
  } | null,
): UserState {
  const email = profile?.email ?? user.email ?? "";
  const inferredRole = inferRoleFromEmail(email);
  const role = (profile?.role as UserRole) ?? inferredRole;

  return {
    id: user.id,
    name:
      profile?.name ??
      (user.user_metadata?.name as string | undefined) ??
      email.split("@")[0].replace(/[._]/g, " "),
    email,
    role: role === "customer" && inferredRole !== "customer" ? inferredRole : role,
    storeId: profile?.store_id ?? (role === "staff" ? "store-central" : undefined),
    phone: profile?.phone ?? (user.user_metadata?.phone as string | undefined) ?? "",
    deliveryAddress: profile?.delivery_address ?? "",
    location: profile?.location ?? "",
  };
}
