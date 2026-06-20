import { RootProvider } from "fumadocs-ui/provider/next";
import "./global.css";
import { Syne } from "next/font/google";
import Head from "next/head";
import Script from "next/script";
import { ReduxProvider } from "@/lib/redux-provider";
import { ThemeProvider } from "@/lib/theme-provider";

const geist = Syne({
	subsets: ["latin"],
});

export const metadata = {
	title: "Jaba Waba | Fresh Organic Juices Delivery",
	description:
		"Fresh, organic juices delivered to your door in Nairobi. Order now and enjoy quality, natural flavors.",
	keywords: ["Jaba Waba", "Fresh Juice", "Organic", "Delivery", "Nairobi"],
	icons: {
		icon: "/favicon.ico",
	},
};

export default function Layout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className={geist.className} suppressHydrationWarning>
			<Script
				defer
				src="https://cloud.umami.is/script.js"
				data-website-id="7e98cb80-cce6-440e-8d23-b1a4abd6adfa"
			/>
			<body className="flex flex-col min-h-screen p-">
				<ThemeProvider>
					<RootProvider>
						<ReduxProvider>{children}</ReduxProvider>
					</RootProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
