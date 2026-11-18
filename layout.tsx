import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loop T-703 Start-up PFD Simulator | HDPE Section 700",
  description: "Interactive SOP & P&ID Simulator for Hexane Stripping Unit T-703 (HD-W-7200-02-001)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-[#0f172a] text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
