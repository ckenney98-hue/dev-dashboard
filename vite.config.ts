import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const pat = env.AZURE_DEVOPS_PAT;
  const org = env.VITE_ADO_ORG || "buildertrend";

  return {
    plugins: [react()],
    server: {
      port: 3333,
      proxy: {
        "/api/ado": {
          target: `https://dev.azure.com`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/ado/, `/${org}`),
          headers: {
            Authorization: `Basic ${Buffer.from(`:${pat}`).toString("base64")}`,
          },
        },
      },
    },
  };
});
