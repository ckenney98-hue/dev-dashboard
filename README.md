# Dev Dashboard

Personal developer dashboard for Azure DevOps teams. Displays sprint work items, pull requests, team PR reviews, and active worktrees in a single view.

Built with React, TypeScript, and Vite.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)

## Quick Setup

```bash
git clone https://github.com/ckenney98-hue/dev-dashboard.git
cd dev-dashboard
pnpm setup
```

This single command will:
1. Install dependencies
2. Create `.env` from `.env.example` and open it for you to fill in
3. Register the dashboard to auto-start on login (Windows Startup folder)
4. Start the dev server

Dashboard runs at **http://localhost:3333**

## Remove Auto-Start

```bash
pnpm remove-autostart
```

Removes the Windows Startup shortcut so the dashboard no longer launches on login.

## Manual Setup

If you prefer to set things up manually:

```bash
pnpm install
cp .env.example .env
# Edit .env with your values
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
