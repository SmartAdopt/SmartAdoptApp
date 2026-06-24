// src/components/molecules/SwipeablePetCard.tsx

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { KeyboardArrowUp as ArrowUpIcon } from "@mui/icons-material";
import type { AIProfileResponse } from "../../types/pets.types";
import "./SwipeablePetCard.css";

// ==========================================
// STATUS TRANSLATION MAP
// ==========================================
const STATUS_LABELS: Record<string, string> = {
  available: "Disponible",
  in_process: "En proceso",
  adopted: "Adoptado",
};

// ==========================================
// COMPONENT PROPS
// ==========================================
interface SwipeablePetCardProps {
  profile: AIProfileResponse;
  isFavorite: boolean;
  isImagePreloaded: boolean; // Whether the image is already cached & decoded
  onPass: () => void;
  onFavorite: () => void;
}

export const SwipeablePetCard = ({
  profile,
  isFavorite,
  isImagePreloaded,
  onPass,
  onFavorite,
}: SwipeablePetCardProps) => {
  const navigate = useNavigate();
  const imgRef = useRef<HTMLImageElement>(null);

  const [swipeDirection, setSwipeDirection] = useState<
    "left" | "right" | "entering" | null
  >("entering");

  // If preloaded, start as loaded immediately (no skeleton flash)
  const [imageLoaded, setImageLoaded] = useState(isImagePreloaded);

  // Derive display values from the AIProfileResponse structure
  const petName = profile.pet.name;
  const petAge = profile.pet.age;
  const petBreed =
    profile.pet.animal_breed.length > 1
      ? profile.pet.animal_breed[1]
      : profile.pet.animal_breed[0];
  const petImage = profile.pet.pet_image_url;
  const statusKey = profile.status?.toLowerCase() || "available";
  const statusLabel = STATUS_LABELS[statusKey] || profile.status;
  const description = profile.emotional_description;
  const tags = profile.tags?.slice(0, 4) || []; // Show max 4 tags

  // When isImagePreloaded changes, update the imageLoaded state
  // Removed useEffect: the imageLoaded state is correctly initialized on mount via useState(isImagePreloaded)
  // because the component is recreated (via key={profile.id}) for each pet.
  // The decode() is already handled by useImagePreloader in the background.

  const handlePass = () => {
    if (swipeDirection === "left" || swipeDirection === "right") return;
    setSwipeDirection("left");
    setTimeout(() => {
      setSwipeDirection(null);
      onPass();
    }, 400);
  };

  const handleFavorite = () => {
    if (swipeDirection === "left" || swipeDirection === "right") return;
    setSwipeDirection("right");
    setTimeout(() => {
      setSwipeDirection(null);
      onFavorite();
    }, 400);
  };

  // Navigate to the pet's detailed profile page
  const handleViewProfile = () => {
    navigate(`/adopter/pet/${profile.id}`);
  };

  // Handle image load — use decode() API for off-thread decoding
  const handleImageLoad = () => {
    const img = imgRef.current;
    if (img && typeof img.decode === "function") {
      img
        .decode()
        .then(() => {
          setImageLoaded(true);
        })
        .catch(() => {
          setImageLoaded(true); // Fallback if decode fails
        });
    } else {
      setImageLoaded(true);
    }
  };

  // Build the dynamic CSS class for the card
  const cardClass = [
    "tinder-card",
    swipeDirection === "left" && "tinder-card--swiping-left",
    swipeDirection === "right" && "tinder-card--swiping-right",
    swipeDirection === "entering" && "tinder-card--entering",
  ]
    .filter(Boolean)
    .join(" ");

  // Build the status badge modifier class
  const badgeClass = [
    "tinder-card__status-badge",
    `tinder-card__status-badge--${statusKey}`,
  ].join(" ");

  return (
    <div className="tinder-card-container">
      <div className={cardClass} key={profile.id}>
        {/* SWIPE STAMP OVERLAYS */}
        <div className="tinder-card__stamp tinder-card__stamp--pass">NOPE</div>
        <div className="tinder-card__stamp tinder-card__stamp--fav">LIKE</div>

        {/* IMAGE SECTION */}
        <div className="tinder-card__image-wrapper">
          {/* Skeleton placeholder — hidden instantly if image is preloaded */}
          {!imageLoaded && <div className="tinder-card__image-skeleton" />}
          <img
            ref={imgRef}
            className={`tinder-card__image ${imageLoaded ? "tinder-card__image--loaded" : "tinder-card__image--loading"}`}
            src={petImage}
            alt={petName}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onLoad={handleImageLoad}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/dog.svg";
              setImageLoaded(true);
            }}
          />
          {/* Status badge */}
          <span className={badgeClass}>{statusLabel}</span>

          {/* Navigate to profile button */}
          <button
            className="tinder-card__swipe-up-hint"
            onClick={handleViewProfile}
            aria-label="Ver perfil completo"
            title="Ver perfil completo"
          >
            <ArrowUpIcon fontSize="small" />
          </button>
        </div>

        {/* CONTENT SECTION */}
        <div className="tinder-card__content">
          <div className="tinder-card__name-row">
            <h2 className="tinder-card__name">{petName},</h2>
            <span className="tinder-card__age">{petAge}</span>
          </div>

          <p className="tinder-card__breed">{petBreed}</p>

          <p className="tinder-card__description">{description}</p>

          {/* Personality tags from AI */}
          {tags.length > 0 && (
            <div className="tinder-card__tags">
              {tags.map((tag, idx) => (
                <span key={idx} className="tinder-card__tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="tinder-card__actions">
          <button
            className="tinder-card__btn tinder-card__btn--pass"
            onClick={handlePass}
            id="tinder-btn-pass"
          >
            <span className="tinder-card__btn-icon">✕</span>
            Pass
          </button>
          <button
            className={`tinder-card__btn tinder-card__btn--favorite ${isFavorite ? "tinder-card__btn--favorited" : ""}`}
            onClick={handleFavorite}
            id="tinder-btn-favorite"
          >
            <span className="tinder-card__btn-icon">
              {isFavorite ? "♥" : "♡"}
            </span>
            {isFavorite ? "Favorited" : "Favorite"}
          </button>
        </div>
      </div>

      {/* Footer hint text */}
      <p className="tinder-card__footer-hint">
        Desliza a la derecha para favorito • Desliza arriba para detalles
      </p>
    </div>
  );
};
