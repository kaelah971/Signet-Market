class UnusedWalletStrategy {
  constructor() {
    throw new Error("This wallet strategy is not enabled for the testnet MVP.");
  }
}

export const LedgerLiveStrategy = UnusedWalletStrategy;
export const LedgerLegacyStrategy = UnusedWalletStrategy;
export const TrezorBip32Strategy = UnusedWalletStrategy;
export const TrezorBip44Strategy = UnusedWalletStrategy;
