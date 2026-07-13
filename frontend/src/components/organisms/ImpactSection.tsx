// src/components/organisms/ImpactSection.tsx
// JAMstack — Full Lifecycle Demonstration
//
// 1. MARKUP: Static content from landing.json is imported and bundled at build
//    time by Vite, providing instant initial render with pre-built data.
// 2. JAVASCRIPT: React's useEffect and useState handle client-side hydration,
//    replacing the static values once the API responds.
// 3. APIs: A fetch call to the backend retrieves live adoption metrics.
//    If the API is unavailable, the component gracefully falls back to the
//    pre-built static data — a key JAMstack resilience benefit.

import { useEffect, useState } from "react";
import { Box, Container, Typography, Grid } from "@mui/material";
import { PUBLIC_ASSETS } from "../../utils/publicAssets";
import { API_BASE_URL } from "../../utils/apiBaseUrl";

// Static JSON import — Vite inlines this at build time (pre-rendered markup).
import landingData from "../../content/landing.json";

// Type-safe mapping from the JSON assetKey strings to the actual asset imports.
const assetMap: Record<string, string> = {
  adopt: PUBLIC_ASSETS.adopt,
  logo: PUBLIC_ASSETS.logo,
  dog: PUBLIC_ASSETS.dog,
  cat: PUBLIC_ASSETS.cat,
};

/** Shape of each metric returned by the live API. */
interface LiveMetric {
  id: string;
  value: string;
}

export const ImpactSection = () => {
  // Initialize state with the pre-built static data from landing.json.
  // This guarantees the section always renders immediately, even if the
  // API is slow or completely unavailable (JAMstack resilience).
  const [metrics, setMetrics] = useState(landingData.impact.metrics);

  // --- JAMstack "API" layer: client-side dynamic hydration ---
  // After the static markup has been painted, we fetch live data from the
  // backend API and merge it into the existing metrics. This upgrades the
  // static page into a live dashboard without a full page reload.
  useEffect(() => {
    const controller = new AbortController();

    const fetchLiveMetrics = async () => {
      try {
        // API_BASE_URL is resolved by Vite's proxy in dev or the deployed URL
        // in production. The endpoint is public and does not require auth.
        const response = await fetch(`${API_BASE_URL}/landing/metrics`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }

        const liveData: LiveMetric[] = await response.json();

        // Merge live values into the static metrics, preserving labels,
        // colors, and assetKeys that are already bundled from the JSON.
        setMetrics((prev) =>
          prev.map((staticMetric) => {
            const liveMatch = liveData.find((m) => m.id === staticMetric.id);
            return liveMatch
              ? { ...staticMetric, value: liveMatch.value }
              : staticMetric;
          })
        );
      } catch (error) {
        // JAMstack graceful degradation: if the API call fails, the
        // component simply keeps displaying the pre-built static values.
        // No blank screen, no spinner — the user always sees content.
        if ((error as Error).name !== "AbortError") {
          console.info(
            "[ImpactSection] Live metrics unavailable — using static data.",
            error
          );
        }
      }
    };

    fetchLiveMetrics();

    // Cleanup: abort the fetch if the component unmounts before it completes.
    return () => controller.abort();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mb: 8 }}>
      <Box
        sx={{
          bgcolor: "#F0FDF4",
          borderRadius: 4,
          py: 6,
          px: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 5 }}>
          {landingData.impact.title}
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {metrics.map((metric) => (
            <Grid item xs={12} sm={6} md={4} key={metric.id}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    bgcolor: metric.color,
                    color: "white",
                    p: 1.5,
                    borderRadius: "50%",
                    mb: 2,
                  }}
                >
                  <img
                    src={assetMap[metric.assetKey]}
                    width={24}
                    alt={metric.label}
                  />
                </Box>
                <Typography variant="h3" color={metric.color} fontWeight={700}>
                  {metric.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {metric.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};
