import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FACEIT Slot Booking",
  description: "FACEIT slot booking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="bg"><body>{children}</body></html>;
}