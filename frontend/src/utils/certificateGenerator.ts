import { jsPDF } from "jspdf";
import type { AdoptionRequest } from "../types/adoption.types";
import type { AIProfileResponse } from "../types/pets.types";

async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url, { mode: "cors" });
  if (!response.ok) throw new Error("Network error");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const generateCertificate = async (
  request: AdoptionRequest,
  petData: AIProfileResponse,
) => {
  // A4 Landscape is 297 x 210 mm
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Background frame
  doc.setDrawColor(55, 125, 255); // primary color
  doc.setLineWidth(3);
  doc.rect(10, 10, 277, 190);

  // Inner frame
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(14, 14, 269, 182);

  // Title
  doc.setTextColor(33, 33, 33);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.text("Certificado de Adopción", 148, 40, { align: "center" });

  // Subtitle
  doc.setFont("helvetica", "italic");
  doc.setFontSize(16);
  doc.setTextColor(100, 100, 100);
  doc.text("Otorgado oficialmente por SmartAdopt", 148, 52, {
    align: "center",
  });

  // Body text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.text("Este documento certifica con orgullo que", 148, 75, {
    align: "center",
  });

  // Adopter Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(55, 125, 255);
  doc.text(request.adopterName || "Adoptante Oficial", 148, 90, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.text("ha adoptado legal y amorosamente a", 148, 105, { align: "center" });

  // Pet Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(245, 114, 0); // Warning/Orange color for contrast
  doc.text(petData.pet.name, 148, 120, { align: "center" });

  // Pet Info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const breed =
    petData.pet.animal_breed.length > 0
      ? petData.pet.animal_breed[0]
      : "Desconocida";
  doc.text(`Raza: ${breed}  |  Edad: ${petData.pet.age} años`, 148, 130, {
    align: "center",
  });

  // Attempt to draw pet image, fallback to no image if CORS or network fails
  if (petData.pet.pet_image_url) {
    try {
      const base64Img = await fetchImageAsBase64(petData.pet.pet_image_url);
      // Center the image (40x40mm image -> X = 148 - 20 = 128)
      doc.addImage(base64Img, "JPEG", 128, 140, 40, 40);
    } catch (error) {
      console.warn(
        "Failed to load pet image for certificate, falling back to text-only:",
        error,
      );
    }
  }

  // Footer / Signatures
  const dateStr = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(dateStr, 60, 175, { align: "center" });
  doc.line(30, 177, 90, 177); // Signature line
  doc.text("Fecha de Aprobación", 60, 183, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.text("SmartAdopt Admin", 237, 175, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.line(207, 177, 267, 177); // Signature line
  doc.text("Firma Autorizada", 237, 183, { align: "center" });

  // Save the PDF
  doc.save(`Certificado_Adopcion_${petData.pet.name.replace(/\s+/g, "_")}.pdf`);
};
