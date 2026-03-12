/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADO_ORG: string;
  readonly VITE_ADO_PROJECT: string;
  readonly VITE_ADO_TEAM: string;
  readonly VITE_STUCK_DAYS_THRESHOLD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
