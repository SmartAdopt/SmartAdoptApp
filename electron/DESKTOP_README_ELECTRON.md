# SmartAdopt — Electron Desktop Integration

This document explains how the **SmartAdopt** web application is packaged as a native Windows desktop application using [Electron](https://www.electronjs.org/) and [electron-builder](https://www.electron.build/). It covers the local development workflow, building installers for QA and Production, and how CI/CD publishes Windows `.exe` installers to AWS S3.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Project Structure](#2-project-structure)
3. [Prerequisites](#3-prerequisites)
4. [Electron Configuration](#4-electron-configuration)
5. [Environment Variables](#5-environment-variables)
6. [Local Development](#6-local-development)
7. [Local Production-Like Build](#7-local-production-like-build)
8. [Google OAuth on Desktop](#8-google-oauth-on-desktop)
9. [CI/CD — QA Pipeline](#9-cicd--qa-pipeline)
10. [CI/CD — Production Pipeline](#10-cicd--production-pipeline)
11. [Required GitHub Secrets](#11-required-github-secrets)
12. [Downloading the Installer from AWS S3](#12-downloading-the-installer-from-aws-s3)
13. [Key Files Reference](#13-key-files-reference)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Overview

SmartAdopt uses **Electron v43** with **Vite** and **vite-plugin-electron** to wrap its React application inside a native desktop shell. The overall flow is:

```
React / Vite source (frontend/src/)
        │
        ▼  npm run dev  (local)  |  npm run build  (production bundle)
   Vite dev server / dist/  (web bundle)
        │
        ▼  vite-plugin-electron
electron/*.ts  →  frontend/dist-electron/  (main + preload scripts)
        │
        ▼  electron-builder --win nsis  (CI / local packaging)
frontend/release/*.exe  (Windows NSIS installer)
        │
        ▼  GitHub Actions + AWS CLI
AWS S3 bucket  (QA or Production)
```

| Environment | Backend API | Branch trigger | S3 bucket |
|-------------|-------------|----------------|-----------|
| **Local** | `http://localhost:8000` (via Vite proxy) or custom `VITE_API_URL` | — | — |
| **QA** | `https://smartadoptqa.programacionwebuce.net/api` | `qa` | `smartadopt-qa-application-exe-bucket` |
| **Production** | `https://smartadoptprod.programacionwebuce.net/api` | `main` | `smartadopt-prod-application-exe-bucket` |

> **Platform support:** CI/CD builds **Windows x64 NSIS installers** only. Local development is supported on Windows, macOS, and Linux, but the automated deploy pipelines run on `windows-latest`.

---

## 2. Project Structure

```
SmartAdoptApp/
├── electron/                              # Electron main-process source (TypeScript)
│   ├── main.ts                            # Main process: window, OAuth popup, IPC
│   ├── preload.ts                         # Preload script exposed to the React app
│   ├── popup-preload.ts                   # Preload for Google OAuth popup window
│   ├── tsconfig.json                      # TypeScript config for Electron sources
│   ├── README.md                          # Short development quick-start
│   └── DESKTOP_README_ELECTRON.md         # This document
├── frontend/
│   ├── src/                               # React application source
│   ├── dist/                              # Vite web build output (generated)
│   ├── dist-electron/                     # Compiled Electron scripts (generated)
│   ├── release/                           # electron-builder installer output (generated)
│   ├── vite.config.ts                     # Vite + vite-plugin-electron configuration
│   └── package.json                       # Scripts, electron-builder config, dependencies
└── .github/workflows/
    ├── deploy-qa-desktop.yml              # QA desktop build & S3 deploy
    └── deploy-prod-desktop.yml            # Production desktop build & S3 deploy
```

### Build artifacts (gitignored)

| Path | Produced by | Contents |
|------|-------------|----------|
| `frontend/dist/` | `vite build` | React SPA static assets |
| `frontend/dist-electron/` | `vite-plugin-electron` | `main.js`, `preload.cjs`, `popup-preload.cjs` |
| `frontend/release/` | `electron-builder` | NSIS installer (`.exe`), unpacked app, block maps |

---

## 3. Prerequisites

Before running or building the desktop app locally you need:

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | 20 LTS | Same version used in CI |
| **npm** | Bundled with Node | |
| **Windows** | 10/11 x64 | Required for building NSIS installers locally |
| **Backend API** | Running locally or remote | Required for authenticated features |

Install frontend dependencies once:

```bash
cd frontend
npm ci
```

---

## 4. Electron Configuration

### Vite plugin

**File:** [`frontend/vite.config.ts`](../frontend/vite.config.ts)

The Electron plugin is enabled by default. It is **disabled** when `VITE_WEB_ONLY=true` (used by the Docker web-only image):

```ts
electron([
  { entry: '../electron/main.ts' },
  { entry: '../electron/preload.ts', /* hot-reload on start */ },
  { entry: '../electron/popup-preload.ts', /* hot-reload on start */ },
])
```

### electron-builder

**File:** [`frontend/package.json`](../frontend/package.json) — `"build"` field

| Setting | Value | Purpose |
|---------|-------|---------|
| `appId` | `net.programacionwebuce.smartadopt.desktop` | Application identifier |
| `productName` | `SmartAdopt` | Display name in installer |
| `directories.output` | `release` | Avoids conflict with Vite `dist/` |
| `win.target` | `nsis` (x64) | Windows installer format |
| `files` | `dist/**/*`, `dist-electron/**/*` | Files bundled into the app |

### Main process entry

**File:** [`frontend/package.json`](../frontend/package.json)

```json
"main": "dist-electron/main.js"
```

electron-builder uses this field as the Electron entry point when packaging the app.

---

## 5. Environment Variables

The React app reads the backend URL from `VITE_API_URL` at **build time** (Vite embeds it into the bundle).

| Environment | `VITE_API_URL` | When set |
|-------------|----------------|----------|
| Local (default) | *(unset — uses Vite proxy)* | `npm run dev` proxies `/api` and `/auth` to `localhost:8000` |
| Local (custom backend) | `http://localhost:8000/api` | Manual override before `build` or `build:electron` |
| QA | `https://smartadoptqa.programacionwebuce.net/api` | GitHub Actions QA workflow |
| Production | `https://smartadoptprod.programacionwebuce.net/api` | GitHub Actions Production workflow |

**Examples:**

```bash
# Build installer pointing to QA backend (local test)
cd frontend
set VITE_API_URL=https://smartadoptqa.programacionwebuce.net/api
npm run build:electron

# Build installer pointing to Production backend (local test)
set VITE_API_URL=https://smartadoptprod.programacionwebuce.net/api
npm run build:electron
```

On macOS/Linux shells, use `export VITE_API_URL=...` instead of `set`.

---

## 6. Local Development

Local development runs Vite and Electron together with hot reload.

### Step 1 — Start the backend

Run the SmartAdopt backend (Docker Compose or local Python server) so API routes are available at `http://localhost:8000`.

### Step 2 — Start the desktop app

```bash
cd frontend
npm run dev
```

This command:

1. Starts the Vite dev server on port `5173`
2. Compiles `electron/*.ts` into `dist-electron/`
3. Launches an Electron window loading the dev server URL

### Development tips

| Action | How |
|--------|-----|
| Open DevTools | `Ctrl + Shift + I` (Windows/Linux) or `Cmd + Option + I` (macOS) |
| API requests | Proxied via Vite (`/api`, `/auth`, `/ws`) — see `vite.config.ts` |
| Reload Electron after main-process changes | Restart `npm run dev` (main process is not hot-reloaded) |
| Reload renderer (React) | Standard Vite HMR |

> The app opens in a **native Electron window**, not in the browser.

---

## 7. Local Production-Like Build

Use this flow to test the packaged desktop app before pushing to CI.

### Option A — Run unpacked build (fast iteration)

```bash
cd frontend
npm run build
npx electron .
```

This loads `dist/index.html` from the compiled Electron main process without creating an installer.

### Option B — Build full Windows installer

```bash
cd frontend
npm run build:electron
```

This runs `npm run build` followed by `electron-builder --win nsis --publish never`.

**Output:**

```
frontend/release/SmartAdopt Setup 0.0.0.exe
frontend/release/win-unpacked/SmartAdopt.exe
```

Run the NSIS installer on Windows to install SmartAdopt like an end user would.

> **Note:** `build:electron` must be executed on **Windows** to produce `.exe` installers. On other OSes, electron-builder can still build for Windows only if a Windows toolchain is available, but the recommended approach is to rely on GitHub Actions for Windows packaging.

---

## 8. Google OAuth on Desktop

Google OAuth requires desktop-specific handling because embedded WebViews are blocked by Google's `disallowed_useragent` policy.

| Mechanism | File | Description |
|-----------|------|-------------|
| User-Agent spoofing | `main.ts` | OAuth popup windows use a standard Chrome user-agent string |
| Popup preload | `popup-preload.ts` | Intercepts `BroadcastChannel` in the OAuth popup |
| IPC bridge | `main.ts` + `preload.ts` | Popup sends token to main process; main process forwards it to React via `oauth-result` |

**React side:** listen through the preload API exposed on `window.electronAPI.onOAuthResult(...)`.

---

## 9. CI/CD — QA Pipeline

**Workflow:** [`.github/workflows/deploy-qa-desktop.yml`](../.github/workflows/deploy-qa-desktop.yml)

### Triggers

| Event | Condition |
|-------|-----------|
| `push` | Branch `qa`, and changes under `frontend/**`, `electron/**`, or the workflow file |
| `workflow_dispatch` | Manual run from GitHub Actions UI |

### Pipeline steps

```
1. Checkout code
2. Set up Node.js 20 (npm cache: frontend/package-lock.json)
3. npm ci  (working-directory: frontend)
4. npm run build:electron
      env: VITE_API_URL=https://smartadoptqa.programacionwebuce.net/api
5. Verify .exe exists in frontend/release/
6. Configure AWS credentials (us-east-1)
7. Upload *.exe to s3://smartadopt-qa-application-exe-bucket/
8. Upload .exe as GitHub Actions artifact (14-day retention)
```

### Concurrency

- Group: `deploy-qa-desktop`
- `cancel-in-progress: true` — a new push to `qa` cancels an in-flight QA desktop deploy

---

## 10. CI/CD — Production Pipeline

**Workflow:** [`.github/workflows/deploy-prod-desktop.yml`](../.github/workflows/deploy-prod-desktop.yml)

### Triggers

| Event | Condition |
|-------|-----------|
| `push` | Branch `main`, and changes under `frontend/**`, `electron/**`, or the workflow file |
| `workflow_dispatch` | Manual run from GitHub Actions UI |

### Pipeline steps

Same as QA, with these differences:

| Setting | QA | Production |
|---------|-----|------------|
| Branch | `qa` | `main` |
| `VITE_API_URL` | `https://smartadoptqa.programacionwebuce.net/api` | `https://smartadoptprod.programacionwebuce.net/api` |
| S3 bucket | `smartadopt-qa-application-exe-bucket` | `smartadopt-prod-application-exe-bucket` |
| Artifact retention | 14 days | 30 days |
| Cancel in progress | Yes | No |

Production builds are **never cancelled mid-flight** (`cancel-in-progress: false`) to avoid partially published installers.

---

## 11. Required GitHub Secrets

Configure these in **Settings → Secrets and variables → Actions**:

| Secret | Required | Description |
|--------|----------|-------------|
| `AWS_ACCESS_KEY_ID` | Yes | IAM access key with S3 write permission |
| `AWS_SECRET_ACCESS_KEY` | Yes | IAM secret key |
| `AWS_SESSION_TOKEN` | Optional | Only needed for temporary STS credentials |

The IAM user or role must allow `s3:PutObject` (and typically `s3:ListBucket`) on the target bucket:

- QA: `arn:aws:s3:::smartadopt-qa-application-exe-bucket/*`
- Production: `arn:aws:s3:::smartadopt-prod-application-exe-bucket/*`

---

## 12. Downloading the Installer from AWS S3

### From GitHub Actions (recommended for developers)

1. Open the repository on GitHub → **Actions**
2. Select **Deploy QA Desktop** or **Deploy Production Desktop**
3. Open the completed workflow run for your commit
4. Download the artifact:
   - QA: `smartadopt-qa-desktop-<commit-sha>`
   - Production: `smartadopt-prod-desktop-<commit-sha>`

### From AWS S3 (direct)

Using the AWS CLI:

```bash
# List available installers (QA)
aws s3 ls s3://smartadopt-qa-application-exe-bucket/

# Download latest QA installer
aws s3 cp s3://smartadopt-qa-application-exe-bucket/ ./downloads/ --recursive --exclude "*" --include "*.exe"

# Production
aws s3 ls s3://smartadopt-prod-application-exe-bucket/
aws s3 cp s3://smartadopt-prod-application-exe-bucket/ ./downloads/ --recursive --exclude "*" --include "*.exe"
```

Using the AWS Console:

1. Open **S3** → select the bucket
2. Locate `SmartAdopt Setup <version>.exe`
3. Download and run the installer on Windows

---

## 13. Key Files Reference

| File | Role |
|------|------|
| [`electron/main.ts`](./main.ts) | Electron main process: window creation, OAuth popup, IPC |
| [`electron/preload.ts`](./preload.ts) | Secure bridge between renderer and main process |
| [`electron/popup-preload.ts`](./popup-preload.ts) | OAuth popup interception script |
| [`electron/tsconfig.json`](./tsconfig.json) | TypeScript settings for Electron sources |
| [`frontend/vite.config.ts`](../frontend/vite.config.ts) | Vite + Electron plugin, dev proxy, test config |
| [`frontend/package.json`](../frontend/package.json) | `build:electron` script and electron-builder config |
| [`.github/workflows/deploy-qa-desktop.yml`](../.github/workflows/deploy-qa-desktop.yml) | QA CI/CD pipeline |
| [`.github/workflows/deploy-prod-desktop.yml`](../.github/workflows/deploy-prod-desktop.yml) | Production CI/CD pipeline |

### npm scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Local development with Electron |
| `build` | `tsc -b && vite build` | Compile web + Electron sources |
| `build:electron` | `npm run build && electron-builder --win nsis --publish never` | Full Windows installer build |

---

## 14. Troubleshooting

### Electron window is blank in development

- Confirm Vite is running on port `5173`
- Check the terminal for Electron or Vite errors
- Restart with `npm run dev`

### API calls fail locally

- Ensure the backend is running on `http://localhost:8000`
- Verify Vite proxy rules in `vite.config.ts` (`/api`, `/auth`, `/ws`)
- For a remote backend, set `VITE_API_URL` before starting dev or building

### Google OAuth fails on desktop

- Confirm you are testing in the Electron app, not the browser
- Check DevTools console in both the main window and OAuth popup
- Verify `popup-preload.cjs` and `preload.cjs` exist in `dist-electron/` after build

### CI workflow does not run

- Push must target `qa` or `main`
- Changes must touch `frontend/**`, `electron/**`, or the workflow file (path filters)
- Alternatively, trigger manually via **workflow_dispatch**

### CI fails at "Verify installer artifact"

- `electron-builder` did not produce a `.exe` in `frontend/release/`
- Review the **Build Electron installer** step logs for electron-builder errors
- Ensure the job runs on `windows-latest`

### S3 upload fails

- Verify `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and (if applicable) `AWS_SESSION_TOKEN`
- Confirm IAM permissions for the target bucket
- Check bucket name and region (`us-east-1`)

### Installed app connects to wrong backend

- `VITE_API_URL` is baked in at build time — rebuild with the correct value
- QA builds must use the QA workflow (or set QA `VITE_API_URL` locally)
- Production builds must use the Production workflow (or set Production `VITE_API_URL` locally)

---

## Related Documentation

- [Electron quick start](./README.md) — short local development guide
- [Android / Capacitor integration](../frontend/MOBILE_ANDROID_README.md) — mobile CI/CD reference with a similar structure
