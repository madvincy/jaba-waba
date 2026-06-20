"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { resolveUserState } from "@/lib/api/auth";
import { getRedirectForRole } from "@/lib/auth-utils";
import { createClient } from "@/lib/supabase/client";
import { useAppDispatch } from "@/lib/redux-hooks";
import { login } from "@/lib/store";
import { SplashScreen } from "@/components/splash-screen";

export default function AuthCompletePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function handleSession(
      session: import("@supabase/supabase-js").Session
    ) {
      if (!isMounted) return;
      try {
        console.log("handleSession - user:", session.user.id);
        const userState = await resolveUserState(session.user, supabase);
        if (!isMounted) return;
        dispatch(login(userState));
        router.replace(getRedirectForRole(userState.role));
      } catch (err) {
        console.error("handleSession failed:", err);
        if (isMounted) router.replace("/auth/signin?error=resolve_failed");
      }
    }

    // Set up listener FIRST before checking session
    // so we never miss an event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("onAuthStateChange:", event, session?.user?.id ?? "no user");

        if (event === "SIGNED_IN" && session) {
          handleSession(session);
        } else if (event === "SIGNED_OUT") {
          if (isMounted) router.replace("/auth/signin?error=no_session");
        }
      }
    );

    // Then check immediately — if session already exists, INITIAL_SESSION
    // fires synchronously with it and handleSession runs right away
    supabase.auth.getSession().then(({ data, error }) => {
      console.log(
        "getSession:",
        data.session?.user?.id ?? "NO SESSION",
        "error:", error
      );

      // If getSession has it but onAuthStateChange hasn't fired yet
      if (data.session && isMounted) {
        handleSession(data.session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe(); // ← now reachable in cleanup
    };
  }, [router, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3 text-slate-600">
        <SplashScreen onComplete={()=>{}} messages={["Signing You In"]}/>
      </div>
    </div>
  );
}
