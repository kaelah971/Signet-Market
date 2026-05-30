const ADMIN_WALLETS = [
  "inj1fgeg5dyv7tnzzvm02tldlfmmq2rs4jcyzayma2",
];

export function isAdminWallet(walletAddress?: string | null) {
  if (!walletAddress) {
    return false;
  }

  return ADMIN_WALLETS.includes(walletAddress.trim());
}
