// file: src/components/shop/WhatsAppFloat.tsx
"use client";

export function WhatsAppFloat() {
  const raw = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "";
  const phone = raw.replace(/\D/g, "");

  if (!phone) return null;

  const text = encodeURIComponent(
    "Olá! Vim pelo site da Cuias Lazaretti e gostaria de mais informações."
  );

  return (
    <a
      href={`https://wa.me/55${phone}?text=${text}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="group fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl md:bottom-6 md:right-6"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="currentColor"
        className="h-5 w-5 shrink-0"
      >
        <path d="M19.11 17.2c-.29-.15-1.69-.83-1.95-.92-.26-.1-.45-.15-.64.15-.19.29-.73.92-.89 1.11-.17.2-.33.22-.62.08-.29-.15-1.2-.44-2.29-1.4-.85-.76-1.43-1.7-1.6-1.99-.17-.29-.02-.45.13-.59.13-.13.29-.33.44-.49.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.52-.08-.15-.64-1.55-.88-2.12-.23-.56-.47-.48-.64-.49l-.55-.01c-.2 0-.52.08-.79.37-.27.29-1.04 1.02-1.04 2.49 0 1.46 1.06 2.88 1.21 3.08.15.2 2.08 3.17 5.05 4.45.71.31 1.27.49 1.7.63.71.22 1.36.19 1.88.12.57-.08 1.69-.69 1.93-1.35.24-.66.24-1.23.17-1.35-.07-.12-.26-.2-.55-.34z" />
        <path d="M16.03 3C8.83 3 3 8.73 3 15.8c0 2.49.73 4.82 1.99 6.79L3.67 29l6.63-1.73a13.1 13.1 0 0 0 5.73 1.29h.01c7.2 0 13.03-5.73 13.03-12.8C29.06 8.73 23.23 3 16.03 3zm0 23.42h-.01a10.9 10.9 0 0 1-5.55-1.51l-.4-.24-3.94 1.03 1.05-3.84-.26-.39a10.63 10.63 0 0 1-1.64-5.66c0-5.9 4.83-10.7 10.76-10.7 2.88 0 5.58 1.11 7.61 3.13a10.56 10.56 0 0 1 3.15 7.57c0 5.9-4.83 10.7-10.77 10.7z" />
      </svg>

      <span className="hidden text-sm font-medium sm:inline">WhatsApp</span>
    </a>
  );
}
