import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoomMate — Find your place in a new city",
  description:
    "Discover rooms, shared flats and short stays that fit your budget and your next move.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
