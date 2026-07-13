# Adoption Applications System

This document describes the implementation of the adoption applications system in the SmartAdopt backend, including the cross-evaluation AI integration using the LLM (provider-agnostic, configured via env vars).

## Overview

The adoption applications system allows adopters to apply for a specific pet. Each application is cross-evaluated by AI, which compares the adopter's suitability form against the pet's profile to generate a compatibility score across 15 evaluation fields.

## Architecture

### Components

1. **Routes** (`app/routes/applications_routes.py`): API endpoints for creating and listing applications
2. **Service** (`app/services/applications_service.py`): Business logic for application creation and retrieval
3. **AI Service** (`app/services/ai_service.py`): `evaluate_adoption_application()` function for cross-compatibility evaluation
4. **Schemas** (`app/schemas/applications_schemas.py`): Pydantic models for request/response validation
5. **Model** (`app/models/applications/application.py`): MongoDB document model

### Application ID Generation

Application IDs are generated using a MongoDB counter with the format `APP{sequence}`:

- `APP1`, `APP2`, `APP3`, etc.
- Stored in MongoDB `counters` collection with counter name `application_counter`

## Endpoints

### 1. POST /applications/{pet_profile_id}

Creates an adoption application for a specific pet.

**Authorization:** `Adopter` role required

**Request:**
```http
POST /applications/PR1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (201 Created):**
```json
{
  "message": "Adoption application created successfully",
  "application_id": "APP1",
  "pet_profile_id": "PR1",
  "status": "pending",
  "created_at": "2026-07-05T12:00:00.000Z"
}
```

**Validation flow:**
1. Adopter must have a completed suitability form (`POST /adoption-forms/submit`)
2. Pet must exist in MongoDB with status `available`
3. No duplicate applications for the same pet
4. AI cross-evaluation is performed
5. Application is stored in MongoDB
6. Pet status is updated to `in_process`

**Error Responses:**
- `400 Bad Request`: Missing adoption form
- `404 Not Found`: Pet not found
- `409 Conflict`: Pet not available or duplicate application
- `403 Forbidden`: User role is not `adopter`
- `401 Unauthorized`: Missing or invalid token

### 2. GET /applications/me

Lists all applications for the authenticated adopter with full pet profile data.

**Authorization:** `Adopter` role required

**Request:**
```http
GET /applications/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "applications": [
    {
      "application_id": "APP1",
      "pet_profile_id": "PR1",
      "total_score": 10,
      "total_max_score": 15,
      "main_score": 8,
      "main_max_score": 11,
      "logistics_education_score": 2,
      "logistics_education_max_score": 4,
      "ai_breakdown": [...],
      "ai_justification": "...",
      "status": "pending",
      "created_at": "2026-07-05T12:00:00.000Z",
      "pet": { ... }
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `403 Forbidden`: User role is not `adopter`
- `401 Unauthorized`: Missing or invalid token

## AI Cross-Evaluation

The `evaluate_adoption_application()` function in `app/services/ai_service.py` uses the configured LLM to evaluate 15 fields:

### Evaluation Fields

**Section I - Candidate Information (3 fields):**
1. `employment_status` - Job compatibility with pet's needs
2. `housing_type` - Housing suitability for pet's size/energy
3. `has_natural_space` - Outdoor space requirement

**Section II - Coexistence and Experience (4 fields):**
4. `has_pets` - Compatibility with existing pets
5. `household_energy` - Energy level match
6. `has_children` - Child compatibility
7. `long_term_commitment` - Commitment understanding

**Section III - Pet Preferences (3 fields):**
8. `preferred_species` - Species match
9. `preferred_gender` - Gender preference
10. `preferred_energy` - Energy preference

**Section V - Motivation (1 field):**
11. `motivation` - Quality and specificity of motivation

**Section IV - Logistics and Education (4 fields):**
12. `daily_time_dedication` - Time availability
13. `sleeping_location` - Sleeping arrangement
14. `behavior_approach` - Training approach
15. `emergency_plan` - Emergency preparedness

### Scoring

- Each field scored 0 (not compatible) or 1 (compatible)
- **Main score**: sum of fields 1-11 (max 11)
- **Logistics score**: sum of fields 12-15 (max 4)
- **Total score**: sum of all 15 fields (max 15)
- Scores are **recalculated server-side** from the breakdown points to avoid AI math errors

### Prompt Template

The AI prompt includes:
- Adopter form data (neighborhood, employment, housing, etc.)
- Pet profile data (name, species, breed, age, description)
- Strict evaluation criteria for each of the 15 fields
- JSON output format requirement

### Sanitization

Form values are sanitized before being embedded in the prompt using a `_safe()` function that:
- Replaces double quotes with single quotes
- Removes newlines and carriage returns
- Handles None values by converting to empty string

### Breakdown Padding

If the AI returns fewer than 15 breakdown items (due to token limits), the missing items are padded with:
- `section`: "Unavailable"
- `field`: `field_{N}`
- `points`: 0
- `max_points`: 1

## Data Model

### MongoDB Collection: `applications`

```json
{
  "_id": "APP1",
  "user_id": 2,
  "pet_profile_id": "PR1",
  "form_id": "AF1",
  "total_score": 10,
  "total_max_score": 15,
  "main_score": 8,
  "main_max_score": 11,
  "logistics_education_score": 2,
  "logistics_education_max_score": 4,
  "ai_breakdown": [
    {
      "section": "I. Candidate Information",
      "field": "employment_status",
      "label": "Employment Status",
      "answer": "employed",
      "evaluation": "Employed and stable",
      "points": 1,
      "max_points": 1
    }
  ],
  "ai_justification": "The applicant demonstrates good compatibility...",
  "status": "pending",
  "created_at": "2026-07-05T12:00:00.000Z"
}
```

### Status Values

- `pending`: Application submitted, awaiting review
- `approved`: Application approved
- `rejected`: Application rejected

## Schemas

### BreakdownItem

```python
class BreakdownItem(BaseModel):
    section: str       # Section name
    field: str         # Field identifier
    label: str         # Human-readable label
    answer: str        # Adopter's answer
    evaluation: str    # AI evaluation text
    points: int        # 0 or 1
    max_points: int    # Always 1
```

### ApplicationResponse

```python
class ApplicationResponse(BaseModel):
    message: str
    application_id: str
    pet_profile_id: str
    status: str
    created_at: datetime
    needs_manual_review: bool = False
```

### ApplicationWithPetResponse

```python
class ApplicationWithPetResponse(BaseModel):
    application_id: str
    pet_profile_id: str
    total_score: int
    total_max_score: int
    main_score: int
    main_max_score: int
    logistics_education_score: int
    logistics_education_max_score: int
    ai_breakdown: List[BreakdownItem]
    ai_justification: str
    status: str
    created_at: datetime
    needs_manual_review: bool = False
    pet: Optional[Dict[str, Any]]
```

### ApplicationListResponse

```python
class ApplicationListResponse(BaseModel):
    applications: List[ApplicationWithPetResponse]
    count: int
```

## Integration with Pet Profiles

When an application is successfully created, the pet's status is updated to `in_process` in the `pet_profiles` collection. This prevents other adopters from applying for the same pet while it's being processed.

## Logging

All application operations are logged using Loguru:

```python
logger.info(f"Creating adoption application for user_id: {user_id}, pet: {pet_profile_id}")
logger.info(f"Starting AI evaluation of adoption application")
logger.info(f"Adoption application created successfully: {application_id}")
logger.warning(f"User {user_id} already applied for pet {pet_profile_id}")
logger.error(f"Failed to insert application into MongoDB: {str(e)}")
```

## Error Handling

The applications service includes comprehensive error handling:

```python
try:
    application = await create_application(mongo_db, user_id, pet_profile_id)
    return ApplicationResponse(...)
except ValueError as e:
    error_msg = str(e).lower()
    if "not found" in error_msg:
        status_code = 404
    elif "not available" in error_msg or "already" in error_msg:
        status_code = 409
    else:
        status_code = 400
    raise HTTPException(status_code=status_code, detail={"message": str(e)})
```