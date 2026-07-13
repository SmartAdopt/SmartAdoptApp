export type AdoptionRequestStatus = "under_review" | "approved" | "rejected";

export interface AdoptionRequest {
  id: string;
  petId: string;
  status: AdoptionRequestStatus;
  dateSubmitted: string; // ISO date string
  lastUpdate: string; // ISO date string
  progressPercentage: number;
  updateMessage: string;
  nextStep: string;
  adopterName?: string;
  adopterEmail?: string;
  adopterPhone?: string;
  aiJustification?: string;
  reviewedByName?: string;
}
