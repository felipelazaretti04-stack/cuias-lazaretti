"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function TrackEvent({ event, payload }: { event: "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase"; payload?: any }) {
  useEffect(() => {
    track(event, payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
