import { apiClient } from "./apiClient";
import type { AdoptionRequest } from "../types/adoption.types";
import type { AIProfileResponse } from "../types/pets.types";
import { dashboardService } from "./dashboard.service";
import { adoptedPetsService } from "./adoptedPets.service";
import { petsService } from "./pets.service";

const LOCAL_STORAGE_KEY = "smartadopt_adoption_requests";

interface ApplicationResponse {
  message: string;
  application_id: string;
  pet_profile_id: string;
  status: string;
  created_at: string;
}

interface ApplicationWithPetResponse {
  application_id: string;
  pet_profile_id: string;
  total_score: number;
  total_max_score: number;
  main_score: number;
  main_max_score: number;
  logistics_education_score: number;
  logistics_education_max_score: number;
  ai_breakdown: unknown[];
  ai_justification: string;
  status: string;
  created_at: string;
  pet?: AIProfileResponse;
}

interface ApplicationListResponse {
  applications: ApplicationWithPetResponse[];
  count: number;
}

export const adoptionRequestsService = {
  _getLocalRequests: (): AdoptionRequest[] => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  _getBackendRequests: async (): Promise<ApplicationWithPetResponse[]> => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role !== "adopter") return [];
      } catch (e) {
        console.warn("Error parsing user from localStorage:", e);
      }
    }

    try {
      const response = await apiClient.get<ApplicationListResponse>(
        "/adoption-forms/me"
      );
      return response.data.applications;
    } catch (error) {
      console.error("Failed to fetch applications from backend", error);
      return [];
    }
  },

  createRequest: async (petId: string): Promise<AdoptionRequest> => {
    const localRequests = adoptionRequestsService._getLocalRequests();
    if (localRequests.some((req) => req.petId === petId)) {
      throw new Error("Ya has enviado una solicitud para esta mascota.");
    }

    const response = await apiClient.post<ApplicationResponse>(
      `/applications/${petId}`
    );

    // Fetch AI Justification immediately for Admin localStorage persistence
    let aiJustification = "Evaluación IA no disponible";
    try {
      const myAppsResponse = await apiClient.get<{
        applications: Record<string, unknown>[];
      }>("/adoption-forms/me");
      const myNewApp = myAppsResponse.data.applications.find(
        (app) => app.application_id === response.data.application_id
      );
      if (myNewApp && typeof myNewApp.ai_justification === "string") {
        aiJustification = myNewApp.ai_justification;
      }
    } catch (e) {
      console.warn("Failed to fetch AI justification", e);
    }

    let adopterName = "Adoptante (Tú)";
    let adopterEmail = "";
    let adopterPhone = "";
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        adopterName = user.name || adopterName;
        adopterEmail = user.email || "";
        adopterPhone = user.phone_number || "";
      } catch (e) {
        console.warn("Error parsing user from localStorage:", e);
      }
    }

    const newRequest: AdoptionRequest = {
      id: response.data.application_id, // Sync ID with backend
      petId: response.data.pet_profile_id,
      status: "under_review",
      dateSubmitted: response.data.created_at,
      lastUpdate: response.data.created_at,
      progressPercentage: 60,
      updateMessage:
        "Tu solicitud ha sido recibida y está siendo evaluada por nuestra IA y equipo.",
      nextStep: "Esperando revisión de la fundación",
      adopterName,
      adopterEmail,
      adopterPhone,
      aiJustification,
    };

    localRequests.push(newRequest);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localRequests));

    return newRequest;
  },

  getRequestsWithPetData: async (): Promise<
    (AdoptionRequest & { pet: AIProfileResponse })[]
  > => {
    const userStr = localStorage.getItem("user");
    let isAdopter = true;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        isAdopter = user.role === "adopter";
      } catch (e) {
        console.warn("Error parsing user from localStorage:", e);
      }
    }

    const localApps = adoptionRequestsService._getLocalRequests();

    // ==========================================
    // FOR ADMINS: Only read from local storage
    // ==========================================
    if (!isAdopter) {
      if (localApps.length === 0) return [];
      const allPets = await petsService.getRawPetsDatabase();
      const mergedAdminData = localApps
        .map((req) => {
          const petData = allPets.find((p) => p.id === req.petId);
          if (!petData) return null;
          return { ...req, pet: petData };
        })
        .filter(Boolean) as (AdoptionRequest & { pet: AIProfileResponse })[];

      return mergedAdminData.sort(
        (a, b) =>
          new Date(b.dateSubmitted).getTime() -
          new Date(a.dateSubmitted).getTime()
      );
    }

    // ==========================================
    // FOR ADOPTERS: Backend AI + Local Overrides
    // ==========================================
    const backendApps = await adoptionRequestsService._getBackendRequests();

    let adopterName = "Adoptante (Tú)";
    let adopterEmail = "";
    let adopterPhone = "";
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        adopterName = user.name || adopterName;
        adopterEmail = user.email || "";
        adopterPhone = user.phone_number || "";
      } catch (e) {
        console.warn("Error parsing user from localStorage:", e);
      }
    }

    const formattedData = backendApps
      .map((app) => {
        const appPetAny = app.pet as unknown as Record<string, unknown>;
        const formattedPet = app.pet
          ? { ...app.pet, id: appPetAny.profile_id ?? appPetAny.id }
          : undefined;

        // Merge with local storage to reflect Admin's approvals/rejections
        const localSync = localApps.find((l) => l.id === app.application_id);

        return {
          id: app.application_id,
          petId: app.pet_profile_id,
          // If local sync exists and is NOT under_review, it means admin modified it
          status:
            localSync && localSync.status !== "under_review"
              ? localSync.status
              : app.status === "pending"
              ? "under_review"
              : (app.status as AdoptionRequest["status"]),
          dateSubmitted: app.created_at,
          lastUpdate: localSync ? localSync.lastUpdate : app.created_at,
          progressPercentage:
            localSync && localSync.status !== "under_review"
              ? localSync.progressPercentage
              : app.status === "approved"
              ? 100
              : app.status === "rejected"
              ? 100
              : 60,
          updateMessage:
            localSync && localSync.status !== "under_review"
              ? localSync.updateMessage
              : app.ai_justification || "Solicitud en revisión.",
          nextStep:
            localSync && localSync.status !== "under_review"
              ? localSync.nextStep
              : app.status === "approved"
              ? "Finalizada"
              : "Esperando revisión",
          adopterName,
          adopterEmail,
          adopterPhone,
          pet: formattedPet as AIProfileResponse,
        };
      })
      .filter((req) => req.pet);

    return formattedData.sort(
      (a, b) =>
        new Date(b.dateSubmitted).getTime() -
        new Date(a.dateSubmitted).getTime()
    );
  },

  hasRequested: async (petId: string): Promise<boolean> => {
    const userStr = localStorage.getItem("user");
    let isAdopter = true;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        isAdopter = user.role === "adopter";
      } catch (e) {
        console.warn("Error parsing user from localStorage:", e);
      }
    }

    if (isAdopter) {
      const existingApps = await adoptionRequestsService._getBackendRequests();
      if (existingApps.some((req) => req.pet_profile_id === petId)) {
        return true;
      }
    }

    // Fallback to local storage (for admins, or if backend check didn't find it)
    const localRequests = adoptionRequestsService._getLocalRequests();
    return localRequests.some((req) => req.petId === petId);
  },

  updateRequestStatus: async (
    requestId: string,
    status: "approved" | "rejected"
  ): Promise<void> => {
    const requests = adoptionRequestsService._getLocalRequests();
    const requestIndex = requests.findIndex((req) => req.id === requestId);

    if (requestIndex === -1) {
      throw new Error("Request not found");
    }

    const request = requests[requestIndex];
    request.status = status;
    request.progressPercentage = 100;
    request.nextStep = "Finalizada";
    request.lastUpdate = new Date().toISOString();

    let notificationTitle: string;
    let notificationDesc: string;

    if (status === "approved") {
      request.updateMessage =
        "¡Felicidades! Tu solicitud ha sido aprobada. Nos pondremos en contacto pronto para finalizar el proceso.";
      notificationTitle = "¡Solicitud Aprobada!";
      notificationDesc = "Tu solicitud de adopción ha sido aprobada.";

      try {
        const allPets = await petsService.getRawPetsDatabase();
        const petData = allPets.find((p) => p.id === request.petId);
        if (petData) {
          const nameToUse = request.adopterName || "Adoptante (Tú)";
          adoptedPetsService.addAdoptedPet(
            petData,
            nameToUse,
            request.adopterEmail,
            request.adopterPhone
          );
          try {
            await petsService.updatePet(request.petId, { status: "adopted" });
          } catch (updateErr) {
            console.error("Error updating pet status", updateErr);
          }
        }
      } catch (error) {
        console.error("Error adding adopted pet", error);
      }
    } else {
      request.updateMessage =
        "Lo sentimos, tu solicitud no ha sido aprobada en esta ocasión. Te animamos a seguir buscando.";
      notificationTitle = "Solicitud Rechazada";
      notificationDesc = "Tu solicitud de adopción no fue aprobada.";
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(requests));
    await dashboardService.addNotification(notificationTitle, notificationDesc);
  },
};
