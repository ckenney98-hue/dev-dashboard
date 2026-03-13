# Dev Dashboard

Personal developer dashboard for Azure DevOps teams. Displays sprint work items, pull requests, team PR reviews, and active worktrees in a single view.

Built with React, TypeScript, and Vite.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)

## Setup

```bash
git clone https://github.com/ckenney98-hue/dev-dashboard.git
cd dev-dashboard
pnpm install
cp .env.example .env
```

Edit `.env` with your values (see below), then start the dev server:

```bash
pnpm dev
```

## Creating an Azure DevOps PAT

1. Go to `https://dev.azure.com/{your-org}/_usersSettings/tokens`
2. Click **New Token**
3. Name it (e.g., "dev-dashboard")
4. Set an expiration date
5. Under **Scopes**, select:
   - **Code** — Read
   - **Work Items** — Read
   - **Build** — Read
6. Click **Create** and copy the token
7. Paste it into `AZURE_DEVOPS_PAT` in your `.env` file

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_ADO_ORG` | Your Azure DevOps organization name |
| `VITE_ADO_PROJECT` | ADO project name |
| `VITE_ADO_TEAM` | Your team name within the project |
| `VITE_ADO_REVIEWER_GROUP_ID` | Group ID used to filter team PR reviews |
| `VITE_STUCK_HOURS_THRESHOLD` | Hours before a PR is considered "stuck" (default: 5) |
| `GIT_REPO_ROOT` | Absolute path to your local git repo (used for worktree detection) |
| `AZURE_DEVOPS_PAT` | Your personal access token (never committed) |

## For Other Devs

After cloning, you just need to:

1. `cp .env.example .env`
2. Fill in your values: `AZURE_DEVOPS_PAT`, `GIT_REPO_ROOT`, `VITE_ADO_REVIEWER_GROUP_ID`
3. `pnpm install && pnpm dev`
