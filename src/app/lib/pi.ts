/** Fixed GCV conversion rate: 1 USD = 314159 π. */
export const GCV_USD = 314159;

export const toPi = (usd: number) => Math.round(usd * GCV_USD).toLocaleString('en-US');
