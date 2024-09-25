export const config = {
  stripe: {
    publishKey: process.env.STRIPE_PUBLISHABLE_KEY!,
    secretKey: process.env.STRIPE_SECRET_KEY!,
    proPriceId: process.env.STRIPE_PRO_PRICE_ID!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
};
