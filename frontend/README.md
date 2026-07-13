# SmartAdopt Frontend

React + TypeScript + Vite application for the SmartAdopt pet adoption platform.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Key Pages / Routes](#key-pages--routes)
- [Services](#services)
- [Run Locally](#run-locally)
- [Adoption Form — Backend Integration Report](#adoption-form--backend-integration-report)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| UI Library | Material UI (MUI) v5 |
| Server State | TanStack React Query |
| Forms | react-hook-form + Zod |
| HTTP Client | Axios (JWT interceptor) |
| Routing | react-router-dom v6 |
| PDF Generation | jspdf + html2canvas |

## Project Structure

```
src/
├── assets/              # Images, icons, SVGs
│   └── placeholders/    # Fallback images
├── components/
│   ├── atoms/           # Smallest reusable units (buttons, chips, cards)
│   ├── molecules/       # Composite components (summary cards, action cards)
│   └── organisms/       # Complex sections (AdminWelcomeBanner, SuitabilitySurvey, FeaturedPetsSection)
├── content/             # Static/markdown page content
├── context/             # React context providers (AuthContext)
├── hooks/               # Custom React hooks
├── pages/
│   ├── admin/           # AdminDashboard, AdminRequestsPage, AdminAdoptedPetsPage, PetRegistration, PetList, etc.
│   ├── adopter/         # AdopterDashboard, AdopterFavorites, AdopterExplore, AdopterSuitability, AdopterSuitabilitySurveyPage, PetProfilePage, MyRequests, etc.
│   └── landing/         # LandingPage (HomePage, AboutUs, ContactUs, LegalPage)
├── routes/              # Route definitions (PublicRoute, ProtectedRoute, admin/adopter guards)
├── services/            # API service layer (apiClient, pets.service, adoptionForm.service, etc.)
├── theme/               # MUI theme configuration (palette, typography, components)
├── types/               # TypeScript type definitions (pets, suitability, adoption requests, etc.)
└── utils/               # Utility functions (certificateGenerator, publicAssets, formatters)
```

## Key Pages / Routes

### Admin Pages
- **`/admin/dashboard`** — Dashboard with real-time stats from MongoDB (total pets, adoptions, pending requests, available pets)
- **`/admin/requests`** — Manage adoption applications: filter by status/pet name, view AI breakdown (translated to Spanish), approve/reject
- **`/admin/adopted-pets`** — View approved adoptions with pet + adopter info fetched from backend
- **`/admin/pets/register`** — Register new pets with AI-generated bio (BLIP + LLM)
- **`/admin/pets/list`** — List and manage registered pets, regenerate AI content

### Adopter Pages
- **`/adopter/home`** — Home with featured available pets, articles, events (real data from backend)
- **`/adopter/explore`** — Browse available pets (only `status === "available"`)
- **`/adopter/pet/:id`** — Pet detail page, submit adoption request
- **`/adopter/suitability`** — Suitability hub, check if survey is completed
- **`/adopter/suitability/survey`** — 5-step suitability form (react-hook-form + Zod)
- **`/adopter/my-requests`** — View submitted applications with status and AI scores

## Services

| Service | File | Key Methods |
|---|---|---|
| `apiClient` | `services/apiClient.ts` | Axios instance with JWT interceptor |
| `adoptionFormService` | `services/adoptionForm.service.ts` | `submitForm()`, `getMyForm()`, `updateMyForm()`, `getAdminForms()`, `reviewApplication()`, `getDashboardStats()` |
| `adoptionRequestsService` | `services/adoptionRequests.service.ts` | `createRequest()`, `getMyRequests()`, `hasRequested()` |
| `petsService` | `services/pets.service.ts` | `getPets()`, `getRawPetsDatabase()`, `registerPet()`, `updatePet()`, `regenerateAI()` |
| `dashboardService` | `services/dashboard.service.ts` | `getFeaturedPets()`, `getArticles()`, `getEvents()`, `getNotifications()` |

### Admin API Methods
- **`getAdminForms(status?, petName?)`** — `GET /adoption-forms/admin` — List forms with optional filters
- **`reviewApplication(applicationId, status)`** — `PUT /adoption-forms/{id}/review` — Approve/reject
- **`getDashboardStats()`** — `GET /admin/dashboard` — Real MongoDB counts

### Translation Utilities (AI → Spanish)
- **`translateAnswer(answer)`** — Maps English answer values to Spanish
- **`translateBreakdownItem(item)`** — Maps AI evaluation `field` + `answer` to Spanish labels

## Run Locally

```bash
# Install dependencies
cd frontend
npm install

# Start dev server (Vite hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server runs on `http://localhost:5173` by default. API requests are proxied to the backend via `VITE_API_URL` env var.

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
```

---

## Real-Time Architecture & Caching

**Date:** 2026-07-12  

### Socket.IO Real-Time Updates
The frontend uses `socket.io-client` in a dedicated hook (`useAppSocketIO`) placed at the layout level to maintain a persistent WebSocket connection. This ensures dynamic UI updates without page reloads:
- **Notifications Panel**: Real-time toast updates and badge counters using `application_status_update`.
- **Admin Dashboard & Adopter Views**: Immediate status syncs when adoption applications change state (`pet_status_update`, `application_status_update`).
- **Favorites Syncing**: Synchronized heart icons across all open tabs/views instantly when a user adds/removes a favorite pet using a unified `favorites_update` internal CustomEvent bridge.

### Redis Caching via Backend
While the frontend still utilizes TanStack Query for optimal client-side caching (stale-while-revalidate), the backend now integrates robust **Redis Caching** for heavy endpoints (e.g., listing available pets, retrieving stats). The frontend benefits from significantly reduced TTFB (Time to First Byte) on these endpoints, making the user experience incredibly fast.