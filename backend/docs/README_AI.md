# AI Integration: BLIP + Llama 3 8B

This document describes the implementation of AI-powered pet profile generation using BLIP and Llama 3 8B models in the SmartAdopt backend.

## Overview

The SmartAdopt backend integrates two AI models to automatically generate enriched pet profiles:

- **BLIP (Bootstrapping Language-Image Pre-training)**: Generates image descriptions from pet photos
- **Llama 3 8B**: Enriches profiles with engaging titles, hashtags, and emotional descriptions

## Architecture

### AI Service Layer

The AI integration is implemented in `app/services/ai_service.py` with two main functions:

#### Model Loading Strategy

**Eager Loading at Startup:**
- BLIP and Llama 3 8B models are loaded eagerly when the service module is imported
- No lazy loading - models are available immediately when needed
- Ensures predictable performance and eliminates first-request latency
- Models remain loaded in memory throughout application lifecycle

#### 1. `describe_image_with_blip(image_url: str) -> str`

Generates a text description of a pet image using the BLIP model.

**Current Implementation:** Placeholder (returns "A pet animal looking friendly and adoptable")

**Future Implementation:**
- Hugging Face Transformers integration
- External API (e.g., OpenAI Vision API)
- Local BLIP model deployment

**Parameters:**
- `image_url`: URL of the pet image

**Returns:**
- String description of the image

**Example:**
```python
blip_description = await describe_image_with_blip("https://example.com/dog.jpg")
# Returns: "A pet animal looking friendly and adoptable"
```

#### 2. `enrich_profile_with_llama(pet_data: Dict[str, Any], blip_description: str) -> Dict[str, Any]`

Enriches pet profile data using the Llama 3 8B model.

**Current Implementation:** Placeholder (generates structured response with title, tags, and emotional description)

**Future Implementation:**
- Hugging Face Transformers integration
- Groq API (fast inference)
- Ollama (local deployment)
- Local Llama 3 8B deployment

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
#   "tags": ["#Adoptable", "#LoyalFriend", "#ReadyForLove"],
#   "emotional_description": "Max is a special being looking for a loving home..."
# }
```

## Integration with Pet Registration

The AI integration is seamlessly integrated into the pet registration flow in `app/services/pet_service.py`:

### Registration Flow

1. **User submits pet data** via `POST /pets/register`
2. **Image URL is processed** using Backblaze B2 service
3. **BLIP generates image description** from the pet photo
4. **Llama 3 8B enriches profile** with title, tags, and emotional description
5. **Complete profile is stored** in MongoDB `pet_profiles` collection
6. **Full profile is returned** to the user

### Code Flow

```python
async def register_pet(db: Session, pet_data: Dict[str, Any]) -> Dict[str, Any]:
    # 1. Validate and process image URL
    image_url = get_image_url(pet_data['pet_image_url'])
    
    # 2. Generate profile ID
    profile_id = f"PR{await get_next_sequence(settings.MONGO_DB, "counters", "profile_counter")}"
    
    # 3. Call BLIP for image description
    blip_description = await describe_image_with_blip(image_url)
    
    # 4. Call Llama 3 8B for profile enrichment
    enriched_data = await enrich_profile_with_llama(pet_data, blip_description)
    
    # 5. Prepare and store complete profile
    profile_document = {
        "_id": profile_id,
        "title": enriched_data["title"],
        "tags": enriched_data["tags"],
        "emotional_description": enriched_data["emotional_description"],
        "status": "available",
        "creation_date": datetime.now(),
        "pet": {...}  # Pet basic information
    }
    
    # 6. Insert into MongoDB
    await profiles_collection.insert_one(profile_document)
    
    # 7. Return complete profile
    return {...}
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
    "tags": ["#Adoptable", "#LoyalFriend", "#ReadyForLove"],
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
    "tags": ["#Adoptable", "#LoyalFriend", "#ReadyForLove"],
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
  "tags": ["#Adoptable", "#Active", "#NeedsExercise"],
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
  "tags": ["#Adoptable", "#LoyalFriend", "#ReadyForLove"],
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

## Future Implementation

### BLIP Integration Options

1. **Hugging Face Transformers**
   ```python
   from transformers import BlipProcessor, BlipForConditionalGeneration
   
   processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
   model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
   ```

2. **External API (OpenAI Vision API)**
   ```python
   import openai
   
   response = openai.chat.completions.create(
       model="gpt-4-vision-preview",
       messages=[{
           "role": "user",
           "content": [{"type": "image_url", "image_url": {"url": image_url}}]
       }]
   )
   ```

3. **Local Deployment**
   - Deploy BLIP model locally using FastAPI or Flask
   - Use ONNX Runtime for inference optimization

### Llama 3 8B Integration Options

1. **Hugging Face Transformers**
   ```python
   from transformers import AutoTokenizer, AutoModelForCausalLM
   
   tokenizer = AutoTokenizer.from_pretrained("meta-llama/Meta-Llama-3-8B")
   model = AutoModelForCausalLM.from_pretrained("meta-llama/Meta-Llama-3-8B")
   ```

2. **Groq API (Fast Inference)**
   ```python
   from groq import Groq
   
   client = Groq(api_key="your-groq-api-key")
   response = client.chat.completions.create(
       model="llama3-8b-8192",
       messages=[{"role": "user", "content": prompt}]
   )
   ```

3. **Ollama (Local Deployment)**
   ```python
   import ollama
   
   response = ollama.chat(model='llama3', messages=[{'role': 'user', 'content': prompt}])
   ```

4. **Local Deployment**
   - Deploy Llama 3 8B using vLLM or llama.cpp
   - Use quantization for memory efficiency

## Logging

All AI operations are logged using Loguru:

```python
logger.info(f"Generating image description with BLIP for URL: {image_url}")
logger.info(f"BLIP description generated: {placeholder_description}")
logger.info(f"Enriching profile with Llama 3 8B for pet: {pet_data.get('name', 'Unknown')}")
logger.info(f"Llama 3 8B enrichment completed for pet: {pet_data.get('name', 'Unknown')}")
logger.warning("BLIP integration not yet implemented - using placeholder")
logger.warning("Llama 3 8B integration not yet implemented - using placeholder")
```

## Error Handling

Both AI functions include comprehensive error handling:

```python
try:
    # AI operation
    result = await ai_function(...)
    logger.info(f"AI operation completed: {result}")
    return result
except Exception as e:
    logger.error(f"AI operation failed: {str(e)}")
    raise Exception(f"AI operation failed: {str(e)}")
```

## Performance Considerations

- AI operations are asynchronous to prevent blocking
- Models are loaded eagerly at startup (no lazy loading)
- Placeholder implementation ensures system stability during development
- Future implementation should include:
  - Request queuing for high-volume scenarios
  - Caching of AI-generated content
  - Timeout handling for external API calls
  - Fallback mechanisms for AI service failures
  - Model quantization for memory efficiency
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

The AI integration in SmartAdopt provides automated pet profile generation using BLIP and Llama 3 8B models. The current implementation uses placeholders to ensure system stability during development, with clear paths for future integration with actual AI models.

The architecture is designed to be:
- **Modular**: AI functions are separate from business logic
- **Asynchronous**: Non-blocking AI operations
- **Extensible**: Easy to swap AI providers
- **Observable**: Comprehensive logging for debugging
- **Resilient**: Error handling and fallback mechanisms
