import { Network, getNetworkChainInfo, getNetworkEndpoints } from "@injectivelabs/networks";

export const injectiveTestnetNetwork = Network.Testnet;
export const injectiveTestnetChainInfo = getNetworkChainInfo(injectiveTestnetNetwork);
export const injectiveTestnetEndpoints = getNetworkEndpoints(injectiveTestnetNetwork);
export const injectiveTestnetChainId = injectiveTestnetChainInfo.chainId;

export const injectiveTestnetKeplrChainInfo = {
  chainId: injectiveTestnetChainId,
  chainName: "Injective Testnet",
  rpc: injectiveTestnetEndpoints.rpc ?? "https://testnet.sentry.tm.injective.network",
  rest: injectiveTestnetEndpoints.rest,
  bip44: {
    coinType: 60,
  },
  bech32Config: {
    bech32PrefixAccAddr: "inj",
    bech32PrefixAccPub: "injpub",
    bech32PrefixValAddr: "injvaloper",
    bech32PrefixValPub: "injvaloperpub",
    bech32PrefixConsAddr: "injvalcons",
    bech32PrefixConsPub: "injvalconspub",
  },
  currencies: [
    {
      coinDenom: "INJ",
      coinMinimalDenom: "inj",
      coinDecimals: 18,
      coinGeckoId: "injective-protocol",
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "INJ",
      coinMinimalDenom: "inj",
      coinDecimals: 18,
      coinGeckoId: "injective-protocol",
      gasPriceStep: {
        low: 500000000,
        average: 700000000,
        high: 900000000,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "INJ",
    coinMinimalDenom: "inj",
    coinDecimals: 18,
    coinGeckoId: "injective-protocol",
  },
  features: ["stargate", "ibc-transfer", "no-legacy-stdTx"],
};
