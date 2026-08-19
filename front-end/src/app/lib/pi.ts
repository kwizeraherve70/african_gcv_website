/**
 * GCV (Global Consensus Value) is a community-proposed target price for Pi —
 * not an official Pi Network rate, and not verified on any exchange.
 * Community convention: 1 π ≈ $314,159 USD.
 */
export const GCV_USD = 314159;

export const toPi = (usd: number) =>
  (usd / GCV_USD).toLocaleString('en-US', { maximumFractionDigits: 8 });

/** Reusable disclaimer for anywhere GCV is presented as a price or rate. */
export const GCV_DISCLAIMER =
  'GCV is a community-proposed target, not an official Pi Network rate or an exchange-verified price.';
