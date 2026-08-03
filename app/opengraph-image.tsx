import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = "PR Gold — Joias em ouro";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Imagem de compartilhamento.
 *
 * Gerada em código, e não a partir de uma foto, por um motivo prático: a
 * PR Gold ainda não forneceu o logotipo em arquivo, e a prévia de link no
 * WhatsApp é onde a marca aparece primeiro. Quando o logo oficial chegar,
 * troque este arquivo por um <img> com o lockup real.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#080808",
          position: "relative",
        }}
      >
        {/* O feixe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            width: 2,
            height: "100%",
            background:
              "linear-gradient(to bottom, rgba(212,175,55,0), rgba(231,203,120,0.85), rgba(212,175,55,0))",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(40% 45% at 50% 50%, rgba(212,175,55,0.20), rgba(8,8,8,0) 70%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span
            style={{
              fontSize: 108,
              color: "#F4F0E8",
              letterSpacing: -2,
              fontFamily: "serif",
            }}
          >
            PR
          </span>
          <span style={{ width: 1, height: 76, background: "rgba(212,175,55,0.6)" }} />
          <span
            style={{
              fontSize: 44,
              color: "#D4AF37",
              letterSpacing: 18,
              textTransform: "uppercase",
            }}
          >
            Gold
          </span>
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 26,
            color: "#D5D2CC",
            letterSpacing: 2,
            display: "flex",
          }}
        >
          {site.tagline}
        </div>
      </div>
    ),
    size
  );
}
