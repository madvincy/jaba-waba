// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/auth/complete";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      // Prevent any caching of the redirect
      response.headers.set("Cache-Control", "no-store");
      return response;
    }

    console.error("exchangeCodeForSession error:", error);
  }

  return NextResponse.redirect(
    `${origin}/auth/signin?error=auth_callback_failed`
  );
}