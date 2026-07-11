# AI Integration: BLIP + Llama (provider-agnostic)

This document describes the implementation of AI-powered pet profile generation using BLIP (local) and a provider-agnostic LLM (via OpenAI-compatible API) in the SmartAdopt backend.

## Overview

The SmartAdopt backend integrates two AI components to automatically generate enriched pet profiles:

- **BLIP (Bootstrapping Language-Image Pre-training)**: Generates image descriptions from pet photos (local Transformers model from Hugging Face Hub)
- **LLM (provider-agnostic)**: Enriches profiles with engaging titles, hashtags, and emotional descriptions via an OpenAI-compatible API (Groq / HF router / any compatible endpoint)

## Architecture

### AI Service Layer

The AI integration is implemented in `app/services/ai_service.py` with two main functions:

#### Model Loading Strategy

**Eager Loading at Startup:**
- BLIP model is loaded eagerly when the service module is imported
- No lazy loading - model is available immediately when needed
- Ensures predictable performance and eliminates first-request latency
- BLIP remains loaded in memory throughout application lifecycle
- **Llama (LLM) is NOT loaded locally** — it's called via external OpenAI-compatible API (configurable via env vars)

#### 1. `describe_image_with_blip(image_url: str) -> str`

Generates a text description of a pet image using the BLIP model (loaded locally from Hugging Face Hub).

**Current Implementation:** Fully implemented — downloads the image, runs BLIP inference, returns a description in Spanish/English.

**Parameters:**
- `image_url`: URL of the pet image (must be HTTPS)

**Returns:**
- String description of the image

**Example:**
```python
blip_description = await describe_image_with_blip("https://example.com/dog.jpg")
# Returns: "a golden retriever dog sitting on a grass field looking at the camera"
```

#### 2. `enrich_profile_with_llama(pet_data: Dict[str, Any], blip_description: str) -> Dict[str, Any]`

Enriches pet profile data using the configured LLM via OpenAI-compatible API.

**Current Implementation:** Fully implemented — sends a prompt with pet data + BLIP description to `{LLAMA_BASE_URL}/chat/completions` and returns a JSON with `title`, `tags`, and `emotional_description`.

**Provider-agnostic:** Works with any OpenAI-compatible endpoint by changing env vars:
- `LLAMA_BASE_URL` — endpoint (e.g. `https://api.groq.com/openai/v1`)
- `LLAMA_MODEL` — model name (e.g. `llama-3.1-8b-instant`)
- `LLAMA_API_KEY` — Bearer token
- `LLAMA_JSON_MODE` — set `true` for structured JSON output (Groq/OpenAI) or `false` for providers without `response_format` support

**Parameters:**
- `pet_data`: Dictionary containing pet information (name, age, gender, etc.)
- `blip_description`: Image description from BLIP

**Returns:**
- Dictionary with AI-generated fields:
  - `title`: Engaging title for the pet
  - `tags`: List of hashtags for social media
  - `emotional_description`: Detailed emotional description

**Example:**
```python
enriched_data = await enrich_profile_with_llama(
    {"name": "Max", "age": 3, "gender": "male", ...},
    "A pet animal looking friendly and adoptable"
)
# Returns:
# {
#   "title": "Max: Your new best friend",
#   "tags": ["#Peludo", "#Juguetón", "#AmigoPeludo"],
#   "emotional_description": "Max is a special being looking for a loving home..."
# }
```

## Integration with Pet Registration

The AI integration is seamlessly integrated into the pet registration flow in `app/services/pet_service.py`:

### Registration Flow

1. **User submits pet data** via `POST /pets/register`
2. **Image URL is processed** using Backblaze B2 service
3. **BLIP generates image description** from the pet photo (non-fatal — continues if BLIP fails)
4. **LLM enriches profile** with title, tags, and emotional description (non-fatal — uses base profile on failure)
5. **Complete profile is stored** in MongoDB `pet_profiles` collection
6. **Full profile is returned** to the user

### Code Flow

```python
# BLIP — non-fatal
try:
    blip_description = await describe_image_with_blip(image_url)
except Exception as e:
    logger.error(f"BLIP failed, continuing without description: {e}")
    blip_description = ""

# LLM enrichment — non-fatal
try:
    enriched_data = await enrich_profile_with_llama(pet_data, blip_description)
except Exception as e:
    logger.error(f"Llama enrichment failed, using base profile: {e}")
    enriched_data = {
        "title": pet_data["name"],
        "tags": [],
        "emotional_description": pet_data.get("brief_description", ""),
    }
```

## Endpoints

### 1. POST /pets/register

Registers a new pet with AI-generated profile.

**Request:**
```json
{
  "name": "Buddy",
  "pet_image_url": "https://example.com/dog.jpg",
  "animal_breed": ["dog", "Golden Retriever"],
  "age": 3,
  "gender": "male",
  "is_sterilized": true,
  "vaccines_up_to_date": ["rabies", "parvovirus", "distemper"],
  "dewormed": true,
  "weight_kg": 8.5,
  "special_conditions": [],
  "brief_description": "Friendly dog looking for a home"
}
```

**Response:**
```json
{
  "message": "Pet registered successfully",
  "profile": {
    "id": "PR1",
    "title": "Buddy: Your new best friend",
    "tags": ["#Peludo", "#Juguetón", "#AmigoPeludo"],
    "emotional_description": "Buddy is a special being looking for a loving home...",
    "status": "available",
    "creation_date": "2026-06-18T05:53:30.061000",
    "pet": {...}
  }
}
```

### 2. POST /pets/{profile_id}/regenerate

Regenerates AI-generated content for an existing profile.

**Request:**
```http
POST /pets/PR1/regenerate
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Profile regenerated successfully",
  "profile": {
    "id": "PR1",
    "title": "Buddy: Your new best friend",
    "tags": ["#Peludo", "#Juguetón", "#AmigoPeludo"],
    "emotional_description": "Buddy is a special being looking for a loving home...",
    "status": "available",
    "creation_date": "2026-06-18T05:53:30.061000",
    "pet": {...}
  }
}
```

**Note:** Only AI-generated fields (title, tags, emotional_description) are regenerated. Pet fields remain unchanged.

### 3. PUT /pets/{profile_id}

Updates pet profile, including AI-generated fields for manual editing.

**Request:**
```json
{
  "age": 4,
  "is_sterilized": false,
  "weight_kg": 9.0,
  "special_conditions": ["Needs daily exercise"],
  "brief_description": "Active dog looking for an active family",
  "title": "Buddy: Your active companion",
  "tags": ["#Peludo", "#Juguetón", "#Explorador"],
  "emotional_description": "Buddy is an energetic dog looking for an active family..."
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "profile": {...}
}
```

## Data Structure

### MongoDB Collection: `pet_profiles`

```json
{
  "_id": "PR1",
  "id": "PR1",
  "title": "Buddy: Your new best friend",
  "tags": ["#Peludo", "#Juguetón", "#AmigoPeludo"],
  "emotional_description": "Buddy is a special being looking for a loving home...",
  "status": "available",
  "creation_date": "2026-06-18T05:53:30.061000",
  "pet": {
    "name": "Buddy",
    "pet_image_url": "https://example.com/dog.jpg",
    "animal_breed": ["dog", "Golden Retriever"],
    "age": 3,
    "gender": "male",
    "is_sterilized": true,
    "vaccines_up_to_date": ["rabies", "parvovirus", "distemper"],
    "dewormed": true,
    "weight_kg": 8.5,
    "special_conditions": [],
    "brief_description": "Friendly dog looking for a home"
  }
}
```

## Profile ID Generation

Profile IDs are generated using a MongoDB counter with the format `PR{sequence}`:

- `PR1`, `PR2`, `PR3`, etc.
- Single counter for all profiles (no separation by animal type)
- Stored in MongoDB `counters` collection with counter name `profile_counter`

## Status Values

Profiles can have the following status values:

- `available`: Pet is available for adoption
- `in_process`: Adoption process in progress
- `adopted`: Pet has been adopted

## Schemas

### PetRegisterRequest

Schema for pet registration (no AI fields - AI is generated automatically).

```python
class PetRegisterRequest(BaseModel):
    name: str
    pet_image_url: str
    animal_breed: List[str]
    age: int
    gender: str
    is_sterilized: bool
    vaccines_up_to_date: List[str]
    dewormed: bool
    weight_kg: float
    special_conditions: List[str]
    brief_description: str
```

### PetRequest

Schema for pet update (includes AI fields for manual editing).

```python
class PetRequest(BaseModel):
    name: str = None
    pet_image_url: str = None
    animal_breed: List[str] = None
    age: int = None
    gender: str = None
    is_sterilized: bool = None
    vaccines_up_to_date: List[str] = None
    dewormed: bool = None
    weight_kg: float = None
    special_conditions: List[str] = None
    brief_description: str = None
    # AI-generated fields (optional for updates)
    title: str = None
    tags: List[str] = None
    emotional_description: str = None
```

### PetProfileResponse

Schema for pet profile response.

```python
class PetProfileResponse(BaseModel):
    id: str
    title: str
    tags: List[str]
    emotional_description: str
    status: str
    creation_date: datetime
    pet: Dict[str, Any]
```

## LLM Integration (Current Implementation)

The backend uses `requests.post` to a generic OpenAI-compatible endpoint (`{LLAMA_BASE_URL}/chat/completions`). This design supports any provider:

```python
import requests

payload = {
    "model": LLAMA_MODEL,
    "messages": [{"role": "user", "content": prompt}],
    "max_tokens": max_tokens,
    "temperature": temperature,
}
if LLAMA_JSON_MODE:
    payload["response_format"] = {"type": "json_object"}

headers = {"Content-Type": "application/json", "Authorization": f"Bearer {LLAMA_API_KEY}"}
resp = requests.post(url, headers=headers, json=payload, timeout=90)
```

No specific client libraries are needed — just `requests` and the env vars.

## Logging

All AI operations are logged using Loguru:

```python
logger.info(f"Generating image description with BLIP for URL: {image_url}")
logger.info(f"BLIP description generated: {description}")
logger.info(f"Sending prompt to Llama (length: {len(prompt)} chars)")
logger.info(f"Raw response from Llama: {content}")
logger.warning(f"BLIP failed, continuing without image description: {str(e)}")
logger.warning(f"LLM call failed (attempt {attempt}/{retries}): {e}")
logger.warning(f"Llama enrichment failed, using base profile: {str(e)}")
```

## Error Handling

AI failures are handled differently depending on context:

**Pet registration (non-fatal):** If BLIP or Llama fail (e.g. network issue, invalid token), the pet is still registered with a base profile (`title=name`, `tags=[]`, `emotional_description=brief_description`). The error is logged but the registration succeeds.

```python
try:
    enriched_data = await enrich_profile_with_llama(pet_data, blip_description)
except Exception as e:
    logger.error(f"Llama enrichment failed, using base profile: {str(e)}")
    enriched_data = {
        "title": pet_data["name"],
        "tags": [],
        "emotional_description": pet_data.get("brief_description", ""),
    }
```

**Adoption application (fatal by default, now non-fatal):** If the LLM evaluation fails, the application is still created with `main_score=0`, `total_score=0`, and `needs_manual_review=true`. This ensures adoptions are never blocked by an AI outage, and the admin can identify applications needing manual review.

```python
except Exception as e:
    logger.error(f"AI evaluation failed, defaulting to manual review: {str(e)}")
    ai_result = {"total_score": 0, "total_max_score": 15, "main_score": 0,
                 "main_max_score": 11, "logistics_education_score": 0,
                 "logistics_education_max_score": 4, "breakdown": [],
                 "justification": "Evaluación automática no disponible — requiere revisión manual"}
    needs_manual_review = True
```

**`_call_llama` retries:** The internal helper retries up to 2 times on any error before propagating the exception.

## Performance Considerations

- AI operations are asynchronous to prevent blocking
- BLIP model is loaded eagerly at startup (no lazy loading)
- LLM calls use `timeout=90` to prevent hanging on API failures
- Retry logic (2 attempts) handles transient provider errors
- Future improvements could include:
  - Request queuing for high-volume scenarios
  - Caching of AI-generated content (currently regenerated on every call)
  - Batch processing for multiple requests

## Security Considerations

- Image URLs are validated before processing
- AI-generated content is stored securely in MongoDB
- Rate limiting should be implemented for AI endpoints
- API keys for external AI services should be stored in environment variables

## Testing

### Unit Tests

```python
async def test_describe_image_with_blip():
    description = await describe_image_with_blip("https://example.com/dog.jpg")
    assert description is not None
    assert isinstance(description, str)

async def test_enrich_profile_with_llama():
    pet_data = {"name": "Max", "age": 3, "gender": "male"}
    blip_description = "A pet animal looking friendly and adoptable"
    enriched_data = await enrich_profile_with_llama(pet_data, blip_description)
    assert "title" in enriched_data
    assert "tags" in enriched_data
    assert "emotional_description" in enriched_data
```

### Integration Tests

```python
async def test_pet_registration_with_ai():
    pet_data = {
        "name": "Buddy",
        "pet_image_url": "https://example.com/dog.jpg",
        "animal_breed": ["dog", "Golden Retriever"],
        "age": 3,
        "gender": "male",
        "is_sterilized": True,
        "vaccines_up_to_date": ["rabies", "parvovirus", "distemper"],
        "dewormed": True,
        "weight_kg": 8.5,
        "special_conditions": [],
        "brief_description": "Friendly dog looking for a home"
    }
    result = await register_pet(db, pet_data)
    assert result["profile"]["title"] is not None
    assert result["profile"]["tags"] is not None
    assert result["profile"]["emotional_description"] is not None
```

## Conclusion

The AI integration in SmartAdopt provides automated pet profile generation using BLIP (local Transformers) and a provider-agnostic LLM (via OpenAI-compatible API). The current implementation uses Groq (`llama-3.1-8b-instant`) but can be switched to any compatible provider by changing env vars.

The architecture is designed to be:
- **Modular**: AI functions are separate from business logic
- **Asynchronous**: Non-blocking AI operations
- **Provider-agnostic**: Swap providers via env vars (no code changes)
- **Resilient**: Non-fatal AI failures on pet registration; manual review fallback on adoption evaluation
