import type { Metadata } from "next";
import "./globals.css";
import { defaultMetadata } from "@/lib/seo";
import { Trackers } from "@/components/shop/Trackers";

export const metadata: Metadata = defaultMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Trackers />
        {children}
      </body>
    </html>
  );
}
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

