// frontend/src/hooks/useMatchScore.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { adoptionFormService } from "../services/adoptionForm.service";
import type { AdoptionFormGetResponse } from "../types/suitability.types";

// WebAssembly module instance cache to avoid multiple fetch calls
let cachedWasmModule: WebAssembly.Instance | null = null;
let isFetching = false;
let fetchPromise: Promise<WebAssembly.Instance> | null = null;

export const useMatchScore = () => {
  const [isReady, setIsReady] = useState<boolean>(cachedWasmModule !== null);
  const [error, setError] = useState<boolean>(false);

  // Fetch real user data
  const { data: form } = useQuery<AdoptionFormGetResponse | null>({
    queryKey: ["adoptionForm"],
    queryFn: adoptionFormService.getMyForm,
    staleTime: 1000 * 60 * 2,
    retry: false, // Don't retry if it fails (e.g., user not logged in or no form)
  });

  // Calculate real user energy and space based on the form, or fallback to defaults
  const { userEnergy, userSpace } = useMemo(() => {
    let energy = 3;
    let space = 2;

    if (form) {
      if (form.household_energy === "very_active") energy = 5;
      else if (form.household_energy === "moderate") energy = 3;
      else if (form.household_energy === "quiet") energy = 1;

      if (form.housing_type === "apartment") {
        space = form.has_natural_space ? 2 : 1;
      } else {
        // rented_house or own_house
        space = form.has_natural_space ? 3 : 2;
      }
    }
    return { userEnergy: energy, userSpace: space };
  }, [form]);

  useEffect(() => {
    // If it's already cached and ready, don't fetch again
    if (cachedWasmModule) {
      return;
    }

    // Only one fetch should happen globally to prevent race conditions
    if (!isFetching) {
      isFetching = true;
      fetchPromise = (async () => {
        try {
          // Native browser API for WebAssembly
          const response = await fetch("/match.wasm");

          if (!response.ok) {
            throw new Error(`Failed to load wasm file: ${response.statusText}`);
          }

          const result = await WebAssembly.instantiateStreaming(response, {
            env: {
              abort: () => console.error("WebAssembly abort called"),
            },
          });

          cachedWasmModule = result.instance;
          setIsReady(true);
          return result.instance;
        } catch (err) {
          console.error(
            "Failed to initialize WebAssembly Match Score module:",
            err
          );
          setError(true);
          throw err;
        } finally {
          isFetching = false;
        }
      })();
    } else if (fetchPromise) {
      // If a fetch is ongoing, attach to its resolution
      fetchPromise.then(() => setIsReady(true)).catch(() => setError(true));
    }
  }, []);

  const calculateScore = useCallback(
    (petEnergy: number, petSize: number): number | null => {
      if (!isReady || error || !cachedWasmModule) return null;

      try {
        const calculateMatchScore = cachedWasmModule.exports
          .calculateMatchScore as (
          a: number,
          b: number,
          c: number,
          d: number
        ) => number;

        return calculateMatchScore(userEnergy, petEnergy, userSpace, petSize);
      } catch (err) {
        console.error("Error executing WebAssembly Match Score function:", err);
        return null;
      }
    },
    [isReady, error, userEnergy, userSpace]
  );

  return {
    isReady,
    error,
    calculateScore,
    userEnergy,
    userSpace,
    hasForm: !!form,
  };
};
