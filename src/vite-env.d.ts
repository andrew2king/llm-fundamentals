/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Google Analytics 4 Measurement ID (e.g., G-XXXXXXXXXX) */
  readonly VITE_GA_MEASUREMENT_ID: string
  /** Google Search Console verification code */
  readonly VITE_GSC_VERIFICATION_CODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}