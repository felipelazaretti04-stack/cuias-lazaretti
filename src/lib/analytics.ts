export const analyticsConfig = {
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  gaId: process.env.NEXT_PUBLIC_GA_ID || "",
};

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
  }
}

export function track(event: "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase", payload?: Record<string, any>) {
  if (typeof window === "undefined") return;

  // Meta
  if (analyticsConfig.metaPixelId && window.fbq) {
    const map: Record<string, string> = {
      ViewContent: "ViewContent",
      AddToCart: "AddToCart",
      InitiateCheckout: "InitiateCheckout",
      Purchase: "Purchase",
    };
    window.fbq("track", map[event], payload || {});
  }

  // GA4
  if (analyticsConfig.gaId && window.gtag) {
    window.gtag("event", event, payload || {});
  }
}
