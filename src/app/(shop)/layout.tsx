// file: src/app/(shop)/layout.tsx
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { WhatsAppFloat } from "@/components/shop/WhatsAppFloat";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
