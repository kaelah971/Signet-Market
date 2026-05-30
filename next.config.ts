import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@injectivelabs/wallet-ledger": "./src/lib/injective/unused-wallet-strategy.ts",
      "@injectivelabs/wallet-trezor": "./src/lib/injective/unused-wallet-strategy.ts",
    },
  },
};

export default nextConfig;
