// file: src/app/(shop)/layout.tsx
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { WhatsAppFloat } from "@/components/shop/WhatsAppFloat";
import { MobileBottomNav } from "@/components/shop/MobileBottomNav";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[hsl(var(--bg))]">
      <Header />
      <main className="pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
      <WhatsAppFloat />
    </div>
  );
}
