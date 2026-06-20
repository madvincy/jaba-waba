import { ReduxProvider } from "@/lib/redux-provider";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <ReduxProvider>{children}</ReduxProvider>;
}
