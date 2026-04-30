// src/core/config/app.config.ts
// ─── Application-wide configuration ──────────────────────────────────────────

export const AppConfig = {
  /** App metadata */
  APP_NAME: "Jaivik Mart",
  APP_VERSION: "1.0.0",
  APP_SLUG: "client",

  /** API configuration — swap per environment */
  API_BASE_URL: "https://iatrogenic-claribel-unwillfully.ngrok-free.dev",
  CDN_BASE_URL: "https://cdn2.zohoecommerce.com",
  STOREFRONT_DOMAIN: "products.tcbtjaivikkisan.com",

  /** Zoho Payments SDK — get from Zoho Payments → Developer Space → API Keys */
  ZOHO_PAYMENTS_API_KEY: "1003.485e2c1d68446d56454c02890412c4f6.3a68857c5822f34d8df8828ec7557455",
  ZOHO_PAYMENTS_ACCOUNT_ID: "60046963789",
  ZOHO_PAYMENTS_REGION: "india" as "india" | "us",
  ZOHO_PAYMENTS_MODE: "live" as "sandbox" | "live",  // must match backend mode


  /** Feature flags */
  FEATURES: {
    ENABLE_UPI_PAYMENT: true,
    ENABLE_CARD_PAYMENT: true,
    ENABLE_SOCIAL_LOGIN: false,
    ENABLE_SEARCH: false, // search route not yet implemented
  },

  /** Cart / Order rules */
  FREE_DELIVERY_THRESHOLD: 500,
  DELIVERY_FEE: 40,

  /** OTP */
  OTP_LENGTH: 6,
  PHONE_LENGTH: 10,
} as const;
