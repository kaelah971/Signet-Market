import type { Metadata } from "next";
import { WalletProvider } from "@/components/wallet/wallet-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Research Market - Proof-of-Research on Injective",
  description:
    "AI finds claims. Humans validate them. Injective records the credibility trail.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
