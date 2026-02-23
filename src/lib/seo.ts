import type { Metadata } from "next";

export function siteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export const brand = {
  name: "Cuias Lazaretti",
  tagline: "A cuia certa pro teu mate.",
  description: "Cuias premium, bombas e acessórios — com estética clean e acabamento premium. Envio Brasil + retirada em Erechim/RS.",
};

export function defaultMetadata(): Metadata {
  const base = new URL(siteUrl());
  return {
    metadataBase: base,
    title: {
      default: brand.name,
      template: `%s • ${brand.name}`,
    },
    description: brand.description,
    openGraph: {
      type: "website",
      url: base,
      siteName: brand.name,
      title: brand.name,
      description: brand.description,
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title: brand.name,
      description: brand.description,
    },
    alternates: { canonical: base },
  };
}
