// frontend/assembly/match.ts

/**
 * Calculates a match score between a user and a pet (0 to 100).
 * 
 * @param userEnergy User's energy level (1-5)
 * @param petEnergy Pet's energy level (1-5)
 * @param userSpace User's available living space (1-3: Small, Medium, Large)
 * @param petSize Pet's size (1-3: Small, Medium, Large)
 * @returns An integer between 0 and 100 representing compatibility.
 */
export function calculateMatchScore(
  userEnergy: i32,
  petEnergy: i32,
  userSpace: i32,
  petSize: i32
): i32 {
  // 1. Energy Match (0 to 50 points)
  let energyDiff = userEnergy - petEnergy;
  if (energyDiff < 0) energyDiff = -energyDiff; // abs
  
  let energyScore = 50 - (energyDiff * 10);
  if (energyScore < 0) energyScore = 0;

  // 2. Space Match (0 to 50 points)
  // If user space is >= pet size, perfect score. Otherwise, penalize.
  const spaceDiff = petSize - userSpace;
  let spaceScore = 50;
  
  if (spaceDiff > 0) {
    spaceScore = 50 - (spaceDiff * 15);
  }
  
  if (spaceScore < 0) spaceScore = 0;

  let totalScore = energyScore + spaceScore;
  
  // Cap at 100
  if (totalScore > 100) totalScore = 100;
  
  return totalScore;
}
