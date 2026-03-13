/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADO_ORG: string;
  readonly VITE_ADO_PROJECT: string;
  readonly VITE_ADO_TEAM: string;
  readonly VITE_ADO_REVIEWER_GROUP_ID: string;
  readonly VITE_STUCK_HOURS_THRESHOLD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
