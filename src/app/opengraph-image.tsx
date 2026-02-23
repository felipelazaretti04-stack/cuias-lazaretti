import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px",
          background: "#0f2a22",
          color: "white",
          gap: "18px",
        }}
      >
        <div style={{ fontSize: 58, fontWeight: 700, letterSpacing: -1 }}>
          Cuias Lazaretti
        </div>
        <div style={{ fontSize: 28, opacity: 0.9 }}>
          A cuia certa pro teu mate.
        </div>
        <div style={{ marginTop: 18, fontSize: 18, opacity: 0.85 }}>
          Premium • Envio Brasil • Retirada em Erechim/RS
        </div>
      </div>
    ),
    size
  );
}
