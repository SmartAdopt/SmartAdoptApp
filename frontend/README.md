# SmartAdopt Frontend

React + TypeScript + Vite application for the SmartAdopt pet adoption platform.

---

## Adoption Form — Backend Integration Report

**Date:** 2026-07-01  
**Routes:** `/adopter/suitability` and `/adopter/suitability/survey`  
**Backend Endpoints:** `POST /adoption-forms/submit`, `GET /adoption-forms/me`, `PUT /adoption-forms/me`

### Summary

The suitability survey form has been fully integrated with the backend API. Previously, the frontend relied on `localStorage` to save survey data and logged dummy data to the console. The application now communicates with the real backend endpoints using JWT-authenticated HTTP requests, ensuring complete data persistence and validation mapping.

---

### Implementation Details

#### 1. API Service Layer
Created a dedicated service module (`src/services/adoptionForm.service.ts`) containing three main methods:
* `submitForm(data)`: Triggers `POST /adoption-forms/submit` to create a new form.
* `getMyForm()`: Triggers `GET /adoption-forms/me` to retrieve the authenticated user's form (returns `null` on 404).
* `updateMyForm(data)`: Triggers `PUT /adoption-forms/me` to update an existing application.
* **Note:** All methods utilize the shared `apiClient`, which automatically injects the JWT Bearer token into the headers.

#### 2. Type Definitions & Data Mapping
Significant refactoring was done in `src/types/suitability.types.ts` to align the frontend interfaces with the backend's Pydantic schemas. 

12 specific data-mapping mismatches were fixed to translate the Spanish UI inputs into the English enums required by the backend:

| Field | Old Frontend Value | New Mapped Value |
|-------|-------------|-------------|
| `daily_time_dedication` | `number` (2, 6, 8) | `string` (`">2"`, `"2-6"`, `"6+"`) |
| `employment_status` | `"Empleado"` | `"employed"` |
| `housing_type` | `"Departamento"` | `"apartment"` |
| `household_energy` | `"Muy activo (deportes...)"` | `"very_active"` |
| `preferred_species` | `"Perro"` | `"dog"` |
| `preferred_gender` | `"Macho"` | `"male"` |
| `preferred_energy` | `"Baja (Tranquilo)"` | `"low"` |
| `sleeping_location` | `"Dentro de casa/cama"` | `"inside"` |
| `behavior_approach` | `"Refuerzo positivo/Educación"` | `"positive_education"` |
| `emergency_plan` | `"Familiar/Amigo"` | `"family_friend"` |
| `user_id` | Hardcoded `1` | Removed (extracted from JWT by backend) |
| `submission_date` / `last_updated` | Client-generated | Removed (Server-generated) |

**Additional TypeScript Updates:**
* Replaced the obsolete `BackendSuitabilityRequest` with `BackendAdoptionFormRequest`.
* Added `BackendAdoptionFormUpdateRequest` for partial `PUT` requests.
* Added standard response interfaces (`AdoptionFormSubmitResponse`, `AdoptionFormGetResponse`, `AdoptionFormUpdateResponse`).
* Implemented a reverse mapper (`mapBackendResponseToSurvey()`) to correctly populate the UI when fetching existing data.

#### 3. Survey Page (`AdopterSuitabilitySurveyPage.tsx`)
* Fetches `GET /adoption-forms/me` on mount to check for existing records.
* Pre-populates the UI if a record exists (unless the user triggered the "redo" flow).
* Handles form submission dynamically, routing to either `POST` (new) or `PUT` (update).
* Integrates visual loading spinners and error alerts for network operations.
* Maintains `localStorage` strictly as a fallback for offline UI states.

#### 4. Suitability Hub (`AdopterSuitability.tsx`)
* Replaced the legacy `localStorage` read with a `react-query` hook fetching from `/adoption-forms/me`.
* Derives the `isSurveyCompleted` boolean directly from the API response (`!!existingForm`).

---

### Bug Fixes

**Stale Cache After Form Submission**
* **Issue:** After submitting the survey, the user was redirected to the hub, but the UI still displayed the "fill for the first time" prompt. A manual refresh was required to update the DOM.
* **Root Cause:** React Query cached the initial `null` response under the `["adoptionForm"]` key. Navigation did not trigger a refetch.
* **Resolution:** Added cache invalidation immediately after a successful API submission to force a fresh fetch.

```ts
import { useQueryClient } from "@tanstack/react-query";
const queryClient = useQueryClient();

// Invoked upon successful POST/PUT
await queryClient.invalidateQueries({ queryKey: ["adoptionForm"] });