import type { Metadata } from "next";
import { StoreProvider } from "@/services/redux/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Vrindavan Rasa Admin",
    template: "%s | Vrindavan Rasa Admin",
  },
  description: "Administration panel for Vrindavan Rasa.",
  applicationName: "Vrindavan Rasa Admin",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: [{ url: "/logo/apple-touch-icon.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
