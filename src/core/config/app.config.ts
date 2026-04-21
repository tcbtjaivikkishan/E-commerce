// src/core/config/app.config.ts
// ─── Application-wide configuration ──────────────────────────────────────────

export const AppConfig = {
  /** App metadata */
  APP_NAME: "Jaivik Mart",
  APP_VERSION: "1.0.0",
  APP_SLUG: "client",

  /** API configuration — swap per environment */
  API_BASE_URL: "https://squatting-wound-diaphragm.ngrok-free.dev",
  CDN_BASE_URL: "https://cdn2.zohoecommerce.com",
  STOREFRONT_DOMAIN: "products.tcbtjaivikkisan.com",

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
