import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luxury Lead Qualifier — Concept Demo",
  description:
    "Concept demo: an AI qualification pipeline for luxury real estate that captures inquiries, scores buyer intent, saves leads to a CRM, schedules WhatsApp follow-ups, and alerts the agent about hot buyers. Simulated.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  );
}
