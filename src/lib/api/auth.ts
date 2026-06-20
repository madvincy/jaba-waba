import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  buildUserStateFromAuth,
  inferRoleFromEmail,
} from "@/lib/auth-utils";
import type { UserState } from "@/lib/store";
import { createUserProfile, getUserProfile } from "./profile";

function getSupabase() {
  return createClient();
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
  phone?: string,
) {
  const supabase = getSupabase();
  const role = inferRoleFromEmail(email);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone, role },
      emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/complete`,
    },
  });

  if (error) return { user: null, session: null, error };

  // Ensure profile exists (trigger may not have run yet)
  if (data.user) {
    await ensureProfile(data.user, supabase, name, phone);
  }

  return { user: data.user, session: data.session, error: null };
}

export async function signInWithEmail(
  email: string,
  password: string,
  supabase?: SupabaseClient  // ← accept optional client
) {
  const client = supabase ?? getSupabase(); // use passed-in client if provided
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error) return { session: null, user: null, error };
  return { session: data.session, user: data.user, error: null };
}

export async function signInWithGoogle() {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/complete`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });

  if (error) return { url: null, error };
  return { url: data.url, error: null };
}

export async function signOut() {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signOut();
  return error;
}

export async function getCurrentUser() {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function resolveUserState(
  user: User,
  supabase?: SupabaseClient,
): Promise<UserState> {
  const client = supabase ?? createClient();

  let profile = await getUserProfile(client, user.id);

  if (!profile) {
    profile = await ensureProfile(user, client);
  }

  if (profile) {
    const inferred = inferRoleFromEmail(profile.email);
    if (profile.role === "customer" && inferred !== "customer") {
      const { data: updated } = await client
        .from("user_profiles")
        .update({
          role: inferred,
          store_id: inferred === "staff" ? "store-central" : profile.store_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();
      if (updated) profile = updated;
    }
  }

  return buildUserStateFromAuth(user, profile);
}

// user first, supabase second — consistent with resolveUserState signature
async function ensureProfile(
  user: User,
  supabase: SupabaseClient,
  name?: string,
  phone?: string,
) {
  const existing = await getUserProfile(supabase, user.id);
  if (existing) return existing;

  const email = user.email ?? "";
  const role = inferRoleFromEmail(email);

  return createUserProfile(supabase, user.id, {
    name:
      name ??
      (user.user_metadata?.name as string | undefined) ??
      email.split("@")[0].replace(/[._]/g, " "),
    email,
    phone: phone ?? (user.user_metadata?.phone as string | undefined),
    role,
    store_id: role === "staff" ? "store-central" : undefined,
  });
}
