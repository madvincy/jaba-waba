"use client";

import { Provider } from "react-redux";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/auth-provider";
import { ShopDataProvider } from "@/components/shop-data-provider";
import { store } from "./store";

export function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ShopDataProvider>{children}</ShopDataProvider>
      </AuthProvider>
    </Provider>
  );
}
