import { SupabaseClient } from "@supabase/supabase-js";
import type { DbUserProfile } from "@/lib/types/database";
import type { UserRole } from "@/lib/store";

export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<DbUserProfile | null> {

  try {
    const queryPromise = supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("getUserProfile query timed out")), 4000)
    );

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
    if (error || !data) return null;
    return data as DbUserProfile;
  } catch (err) {
    console.error("getUserProfile failed:", err);
    return null;
  }
}

export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: {
    name?: string;
    email?: string;
    phone?: string;
    delivery_address?: string;
    location?: string;
  }
) {
  console.log("updateUserProfile - supabase:", supabase);
  console.log("updateUserProfile - supabase type:", typeof supabase);
  console.log("updateUserProfile - userId:", userId);
  console.log("updateUserProfile - updates:", updates);
  const { data, error } = await supabase
    .from("user_profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function createUserProfile(
  supabase: SupabaseClient,
  userId: string,
  profileData: {
    name: string;
    email: string;
    phone?: string;
    delivery_address?: string;
    location?: string;
    role?: UserRole;
    store_id?: string;
  }
) {
  console.log("createUserProfile - supabase:", supabase);
  console.log("createUserProfile - supabase type:", typeof supabase);
  console.log("createUserProfile - userId:", userId);
  console.log("createUserProfile - profileData:", profileData);
  const { data, error } = await supabase
    .from("user_profiles")
    .insert([{ id: userId, role: profileData.role ?? "customer", ...profileData }])
    .select()
    .single();

  if (error) return null;
  return data;
} 