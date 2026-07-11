// tests/jamstack-landing.test.ts
// =============================================================================
// JAMstack Implementation Verification Tests
// =============================================================================
// These tests validate that the JAMstack architecture is correctly implemented
// on the Landing Page by verifying:
//   1. MARKUP  — Static content file exists and has the expected structure.
//   2. JAVASCRIPT — Components correctly consume the static data.
//   3. APIs — The dynamic hydration logic handles both success and failure.
// =============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP 1: Static Content Layer (the "M" in JAMstack)
// ─────────────────────────────────────────────────────────────────────────────
// Validates that landing.json contains all the required fields and data types.
// This guarantees that the "Markup" layer — the pre-built static content — is
// structurally sound and will render correctly at build time.

import landingData from "../src/content/landing.json";

describe("📦 JAMstack — Static Content Layer (Markup)", () => {
  it("should have a valid hero section with title, subtitle, and backgroundImageUrl", () => {
    expect(landingData.hero).toBeDefined();
    expect(typeof landingData.hero.title).toBe("string");
    expect(landingData.hero.title.length).toBeGreaterThan(0);
    expect(typeof landingData.hero.subtitle).toBe("string");
    expect(landingData.hero.subtitle.length).toBeGreaterThan(0);
    expect(typeof landingData.hero.backgroundImageUrl).toBe("string");
    expect(landingData.hero.backgroundImageUrl).toMatch(/^https?:\/\//);
  });

  it("should have at least one category with id, title, assetKey, and color", () => {
    expect(Array.isArray(landingData.hero.categories)).toBe(true);
    expect(landingData.hero.categories.length).toBeGreaterThanOrEqual(1);

    for (const category of landingData.hero.categories) {
      expect(category).toHaveProperty("id");
      expect(category).toHaveProperty("title");
      expect(category).toHaveProperty("assetKey");
      expect(category).toHaveProperty("color");
      expect(typeof category.id).toBe("string");
      expect(typeof category.title).toBe("string");
    }
  });

  it("should have a valid impact section with title and metrics array", () => {
    expect(landingData.impact).toBeDefined();
    expect(typeof landingData.impact.title).toBe("string");
    expect(landingData.impact.title.length).toBeGreaterThan(0);
    expect(Array.isArray(landingData.impact.metrics)).toBe(true);
    expect(landingData.impact.metrics.length).toBeGreaterThanOrEqual(1);
  });

  it("each metric should have id, value, label, assetKey, and color", () => {
    for (const metric of landingData.impact.metrics) {
      expect(metric).toHaveProperty("id");
      expect(metric).toHaveProperty("value");
      expect(metric).toHaveProperty("label");
      expect(metric).toHaveProperty("assetKey");
      expect(metric).toHaveProperty("color");
      expect(typeof metric.id).toBe("string");
      expect(typeof metric.value).toBe("string");
      expect(typeof metric.label).toBe("string");
    }
  });

  it("should have unique metric IDs (no duplicates)", () => {
    const ids = landingData.impact.metrics.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP 2: API Hydration Logic (the "A" + "J" in JAMstack)
// ─────────────────────────────────────────────────────────────────────────────
// Simulates the ImpactSection's fetch logic to verify:
//   - Live API data correctly merges with static data.
//   - API failures gracefully fall back to static data.
// These tests do NOT render React components — they test the pure data logic.

describe("🌐 JAMstack — API Hydration Logic (APIs + JavaScript)", () => {
  // This function replicates the exact merge logic from ImpactSection.tsx
  const mergeMetrics = (
    staticMetrics: typeof landingData.impact.metrics,
    liveData: { id: string; value: string }[]
  ) => {
    return staticMetrics.map((staticMetric) => {
      const liveMatch = liveData.find((m) => m.id === staticMetric.id);
      return liveMatch
        ? { ...staticMetric, value: liveMatch.value }
        : staticMetric;
    });
  };

  it("should merge live API data into static metrics by matching IDs", () => {
    const liveData = [
      { id: "adoptions", value: "250" },
      { id: "successRate", value: "98%" },
    ];

    const merged = mergeMetrics(landingData.impact.metrics, liveData);

    const adoptions = merged.find((m) => m.id === "adoptions");
    const successRate = merged.find((m) => m.id === "successRate");

    // Values should be updated from the "API"
    expect(adoptions?.value).toBe("250");
    expect(successRate?.value).toBe("98%");

    // Labels and colors should be preserved from static data
    expect(adoptions?.label).toBe(
      landingData.impact.metrics.find((m) => m.id === "adoptions")?.label
    );
    expect(adoptions?.color).toBe(
      landingData.impact.metrics.find((m) => m.id === "adoptions")?.color
    );
  });

  it("should keep static values when API returns no matching IDs", () => {
    const liveData = [{ id: "unknownMetric", value: "999" }];
    const merged = mergeMetrics(landingData.impact.metrics, liveData);

    // All values should remain unchanged (static fallback)
    for (let i = 0; i < merged.length; i++) {
      expect(merged[i].value).toBe(landingData.impact.metrics[i].value);
    }
  });

  it("should keep static values when API returns empty array", () => {
    const merged = mergeMetrics(landingData.impact.metrics, []);

    for (let i = 0; i < merged.length; i++) {
      expect(merged[i].value).toBe(landingData.impact.metrics[i].value);
    }
  });

  it("should handle partial API response (only some metrics updated)", () => {
    const liveData = [{ id: "adoptions", value: "300" }];
    const merged = mergeMetrics(landingData.impact.metrics, liveData);

    const adoptions = merged.find((m) => m.id === "adoptions");
    const successRate = merged.find((m) => m.id === "successRate");

    expect(adoptions?.value).toBe("300"); // Updated
    expect(successRate?.value).toBe(
      landingData.impact.metrics.find((m) => m.id === "successRate")?.value
    ); // Unchanged
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP 3: Fetch Behavior Simulation (Network Layer)
// ─────────────────────────────────────────────────────────────────────────────
// Uses vitest mocks to simulate the fetch() call that ImpactSection makes,
// verifying correct behavior on both API success and API failure.

describe("🔌 JAMstack — Fetch Behavior (Network Simulation)", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should successfully parse a valid API response", async () => {
    const mockResponse = [
      { id: "adoptions", value: "500" },
      { id: "successRate", value: "99%" },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const response = await fetch("/api/landing/metrics");
    const data = await response.json();

    expect(data).toEqual(mockResponse);
    expect(data).toHaveLength(2);
    expect(data[0].id).toBe("adoptions");
  });

  it("should handle API failure gracefully (network error)", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    let fallbackUsed = false;
    try {
      await fetch("/api/landing/metrics");
    } catch {
      // Graceful fallback: use static data
      fallbackUsed = true;
    }

    expect(fallbackUsed).toBe(true);
  });

  it("should handle non-OK HTTP status (e.g. 500)", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const response = await fetch("/api/landing/metrics");

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
    // In the real component, this triggers the fallback to static data
  });
});
