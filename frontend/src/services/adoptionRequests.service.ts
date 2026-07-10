import type { AdoptionRequest } from "../types/adoption.types";
import { petsService } from "./pets.service";
import type { AIProfileResponse } from "../types/pets.types";
import { dashboardService } from "./dashboard.service";
import { adoptedPetsService } from "./adoptedPets.service";

const LOCAL_STORAGE_KEY = "smartadopt_adoption_requests";

// Helper to simulate network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const adoptionRequestsService = {
  /**
   * Retrieves all requests from local storage.
   */
  _getLocalRequests: (): AdoptionRequest[] => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  /**
   * Creates a new adoption request for a pet.
   */
  createRequest: async (petId: string): Promise<AdoptionRequest> => {
    await delay(600); // Simulate network

    const requests = adoptionRequestsService._getLocalRequests();

    // Check if already requested
    if (requests.some((req) => req.petId === petId)) {
      throw new Error("Ya has enviado una solicitud para esta mascota.");
    }

    const userStr = localStorage.getItem("user");
    let adopterName = "Adoptante (Tú)";
    let adopterEmail = "";
    let adopterPhone = "";
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        adopterName = user.name || adopterName;
        adopterEmail = user.email || "";
        adopterPhone = user.phone_number || "";
      } catch {
        // ignore JSON parse error
      }
    }

    const newRequest: AdoptionRequest = {
      id: `req_${Date.now()}`,
      petId,
      status: "under_review",
      dateSubmitted: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      progressPercentage: 60, // Starting progress for 'under_review' as per design
      updateMessage:
        "Your application looks great! We're currently reviewing your references.",
      nextStep: "Pending reference check completion",
      adopterName,
      adopterEmail,
      adopterPhone,
    };

    requests.push(newRequest);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(requests));

    return newRequest;
  },

  /**
   * Gets a merged list of requests and real pet data.
   */
  getRequestsWithPetData: async (): Promise<
    (AdoptionRequest & { pet: AIProfileResponse })[]
  > => {
    await delay(800); // Simulate network

    const requests = adoptionRequestsService._getLocalRequests();
    if (requests.length === 0) return [];

    // Fetch real pet data
    const allPets = await petsService.getRawPetsDatabase();

    // Merge and filter out requests where the pet might have been deleted
    const mergedData = requests
      .map((req) => {
        const petData = allPets.find((p) => p.id === req.petId);
        if (!petData) return null;
        return { ...req, pet: petData };
      })
      .filter(Boolean) as (AdoptionRequest & { pet: AIProfileResponse })[];

    // Sort by date descending
    return mergedData.sort(
      (a, b) =>
        new Date(b.dateSubmitted).getTime() -
        new Date(a.dateSubmitted).getTime(),
    );
  },

  /**
   * Checks if the user has already requested a specific pet.
   */
  hasRequested: async (petId: string): Promise<boolean> => {
    await delay(300);
    const requests = adoptionRequestsService._getLocalRequests();
    return requests.some((req) => req.petId === petId);
  },

  /**
   * Updates the status of an adoption request (e.g. approve or reject).
   */
  updateRequestStatus: async (
    requestId: string,
    status: "approved" | "rejected",
  ): Promise<void> => {
    await delay(500);

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

      // Add to adopted pets list
      try {
        const allPets = await petsService.getRawPetsDatabase();
        const petData = allPets.find((p) => p.id === request.petId);
        if (petData) {
          const nameToUse = request.adopterName || "Adoptante (Tú)";
          adoptedPetsService.addAdoptedPet(
            petData,
            nameToUse,
            request.adopterEmail,
            request.adopterPhone,
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

    // Save updated request
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(requests));

    // Dispatch notification
    await dashboardService.addNotification(notificationTitle, notificationDesc);
  },
};
