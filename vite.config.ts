import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { localGitApi } from "./plugins/localGitApi";
import { edgeBookmarksApi } from "./plugins/edgeBookmarksApi";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const pat = env.AZURE_DEVOPS_PAT || process.env.AZURE_DEVOPS_PAT;
  const org = env.VITE_ADO_ORG || "buildertrend";
  const repoRoot = env.GIT_REPO_ROOT || "C:/repos/BTNet";

  if (!pat) {
    console.warn(
      "\n⚠️  AZURE_DEVOPS_PAT not found. Set it as a system environment variable or in .env\n"
    );
  }

  return {
    plugins: [react(), localGitApi(repoRoot), edgeBookmarksApi()],
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
