# JAMstack Validation Guide for the SmartAdopt Landing Page

This document explains how to prove that the landing page is a valid, functional JAMstack implementation with standard robustness.

Scope: landing page only.

## What the implementation does

- Static base content comes from [src/content/landing.json](../src/content/landing.json).
- The hero renders from static data in [src/components/organisms/HeroSection.tsx](../src/components/organisms/HeroSection.tsx).
- The impact section starts with static values and hydrates live metrics from `/api/landing/metrics` in [src/components/organisms/ImpactSection.tsx](../src/components/organisms/ImpactSection.tsx).
- The landing page composes both sections in [src/pages/HomePage.tsx](../src/pages/HomePage.tsx).

## How to prove it works

### Visual proof

Run the app with Docker and verify that:

- The hero renders with title, subtitle, and background image.
- The category buttons appear even if the backend is offline.
- The impact section renders metrics without a blank screen or visible error state.

If you want a stronger check, stop the backend and reload the page. The hero should still render and the impact values should remain visible from the static JSON.

### Technical proof

- The landing content is prebuilt and static.
- React consumes that content without SSR.
- `ImpactSection` tries to hydrate live data but keeps the static values if the API fails.
- No external CMS is required for the landing to work.

### Test proof

Run the dedicated JAMstack test suite:

```bash
cd frontend
npm run test -- tests/jamstack-landing.test.ts
```

This test checks:

- The structure of the static JSON.
- The merge between static and live data.
- The fallback behavior when the API fails or returns a non-OK response.

## Docker flow

From the repository root:

```bash
docker compose -f docker-compose-local.yml up -d --build
docker compose -f docker-compose-local.yml ps
docker compose -f docker-compose-local.yml logs -f frontend backend
```

The landing should be available on the port defined by `FRONTEND_EXTERNAL_PORT` in your `.env` file.

## Offline and failure checks

Use these checks to prove the landing is not dependent on network access for its core content:

1. Stop the backend and reload the landing.
2. Force `/api/landing/metrics` to return an error or 500.
3. Open DevTools, enable offline mode, and reload.

In all three cases, the page should remain usable because the static content is already built into the frontend.

## Fallback log

If the API is unavailable, `ImpactSection` logs a fallback message like this:

```text
[ImpactSection] Live metrics unavailable — using static data.
```

That log confirms the app did not fail and used the static fallback path.

## What you do not need

For this landing page scope, you do not need:

- Astro.
- Contentful.
- A new headless CMS.
- SSR.
- Extra SSG tooling.

They do not add value here because the landing already works with static JSON, React, and one optional API call.

## Acceptance criteria

The implementation is acceptable if all of these are true:

1. The landing works with Docker and does not need external services to show the main content.
2. The hero and impact sections still render when the backend is unavailable.
3. The API only enhances content, it is not required for the page to work.
4. [jamstack-landing.test.ts](jamstack-landing.test.ts) passes locally.
5. No additional CMS or framework is needed to justify the landing as JAMstack.

## Short defense

SmartAdopt's landing page is JAMstack because the critical content is served from a static JSON file, the UI is rendered by prebuilt React components, and the only dynamic behavior is a small client-side hydration step with a safe fallback. Docker is just the way the project is started; it does not change the static-first architecture.
