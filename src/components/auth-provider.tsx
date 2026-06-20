"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { resolveUserState } from "@/lib/api/auth";
import { useAppDispatch } from "@/lib/redux-hooks";
import { login, logout } from "@/lib/store";
import { SplashScreen } from "./splash-screen";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    // Listen FIRST — never miss an event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    
      if (session?.user && isMounted) {
        try {
          const userState: any = await Promise.race([
            resolveUserState(session.user, supabase),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error("resolveUserState timed out after 5s")), 5000)
            )
          ]);
          if (isMounted) {
            dispatch(login(userState));
            console.log("3️⃣ dispatched login");
          }
        } catch (err) {
          console.error("❌ resolveUserState threw:", err);
          if (isMounted) dispatch(logout());
        }
      } else if (event === "INITIAL_SESSION" && !session) {
        if (isMounted) dispatch(logout());
      } else if (event === "SIGNED_OUT") {
        if (isMounted) dispatch(logout());
      }
    });
  }, [dispatch]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }
  return <>{children}</>;
}