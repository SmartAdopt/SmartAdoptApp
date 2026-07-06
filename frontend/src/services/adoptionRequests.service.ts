import type { AdoptionRequest } from "../types/adoption.types";
import { petsService } from "./pets.service";
import type { AIProfileResponse } from "../types/pets.types";

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
};
