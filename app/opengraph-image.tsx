import { ImageResponse } from "next/og";

import { PAGE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

export const runtime = "edge";
export const alt = SITE_NAME;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const ROWS = [
  ["45.83.64.12", "3", "🇳🇱 Netherlands", "AS49447"],
  ["8.8.8.8", "1", "🇺🇸 United States", "AS15169"],
  ["24.48.0.1", "1", "🇨🇦 Canada", "AS5769"],
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          width: "100%",
          background: "#f4f4f5",
          padding: "56px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              fontSize: "24px",
              fontWeight: 700,
              color: "#3f3f46",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "#18181b",
                color: "#a3e635",
                fontSize: "24px",
              }}
            >
              &gt;_
            </div>
            {SITE_NAME}
          </div>

          <div
            style={{
              marginTop: "26px",
              fontSize: "62px",
              lineHeight: 1.05,
              fontWeight: 800,
              color: "#18181b",
              maxWidth: "900px",
            }}
          >
            Paste raw logs. Get enriched IPs.
          </div>
          <div
            style={{
              marginTop: "18px",
              fontSize: "24px",
              lineHeight: 1.4,
              color: "#71717a",
              maxWidth: "820px",
            }}
          >
            {PAGE_DESCRIPTION}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid #e4e4e7",
          }}
        >
          <div
            style={{
              display: "flex",
              background: "#18181b",
              color: "#d4d4d8",
              fontSize: "18px",
              fontWeight: 700,
              padding: "12px 22px",
            }}
          >
            <div style={{ display: "flex", width: "270px" }}>IP ADDRESS</div>
            <div style={{ display: "flex", width: "110px" }}>HITS</div>
            <div style={{ display: "flex", width: "360px" }}>COUNTRY</div>
            <div style={{ display: "flex" }}>ASN</div>
          </div>
          {ROWS.map((row, index) => (
            <div
              key={row[0]}
              style={{
                display: "flex",
                background: index % 2 === 1 ? "#fafafa" : "#ffffff",
                color: "#27272a",
                fontSize: "22px",
                padding: "14px 22px",
              }}
            >
              <div style={{ display: "flex", width: "270px", fontFamily: "monospace" }}>
                {row[0]}
              </div>
              <div style={{ display: "flex", width: "110px", fontFamily: "monospace" }}>
                {row[1]}
              </div>
              <div style={{ display: "flex", width: "360px" }}>{row[2]}</div>
              <div style={{ display: "flex", fontFamily: "monospace", color: "#52525b" }}>
                {row[3]}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
