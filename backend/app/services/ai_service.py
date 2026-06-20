from typing import Dict, Any
from app.utils.logger.logger_config import logger
from app.config import settings
import requests
import json
from PIL import Image
from io import BytesIO
from transformers import BlipProcessor, BlipForConditionalGeneration
from huggingface_hub import InferenceClient

# load huggingface token
hf_token = settings.HF_TOKEN
if hf_token:
    logger.info("HF_TOKEN is configured for Hugging Face Hub")
else:
    logger.warning("HF_TOKEN not set - using unauthenticated requests")

# Load AI models at startup
logger.info("Loading BLIP models...")
blip_processor = BlipProcessor.from_pretrained(
    "Salesforce/blip-image-captioning-base", revision="main"
)
blip_model = BlipForConditionalGeneration.from_pretrained(
    "Salesforce/blip-image-captioning-base", revision="main"
)
logger.info("BLIP models loaded successfully")

logger.info("Loading Llama 3 8B client...")
llama_client = InferenceClient(
    model="meta-llama/Meta-Llama-3-8B-Instruct",
    token=hf_token,
)
logger.info("Llama 3 8B client loaded successfully")


async def describe_image_with_blip(image_url: str) -> str:
    # Generate image description using BLIP model
    logger.info(f"Generating image description with BLIP for URL: {image_url}")

    # Validate URL
    if not image_url:
        logger.error("Image URL is empty")
        raise ValueError("Image URL cannot be empty")
    # Validate URL format
    if not image_url.startswith("https://"):
        logger.error(f"Invalid URL format: {image_url}")
        raise ValueError("Image URL must start with https://")

    # Download image from URL
    logger.info(f"Downloading image from URL: {image_url}")
    try:
        response = requests.get(image_url, timeout=30)
        image = Image.open(BytesIO(response.content))
    except requests.RequestException as e:
        logger.error(f"Failed to download image: {str(e)}")
        raise Exception("Failed to download image")
    except (IOError, OSError) as e:
        logger.error(f"Failed to process image: {str(e)}")
        raise Exception("Failed to process image")

    # Process image and generate caption
    inputs = blip_processor(image, return_tensors="pt")
    # Generate caption
    outputs = blip_model.generate(**inputs, max_length=50)
    description = blip_processor.decode(outputs[0], skip_special_tokens=True)

    # Validate description
    if not description:
        logger.error("BLIP generated empty description")
        raise ValueError("BLIP generated empty description")

    logger.info(f"BLIP description generated: {description}")
    return description


async def enrich_profile_with_llama(
    pet_data: Dict[str, Any], blip_description: str
) -> Dict[str, Any]:
    logger.info("Enriching pet profile with Llama 3 8B")

    # Validate inputs
    if not pet_data:
        logger.error("Pet data is invalid")
        raise ValueError("Pet data must be a non-empty dictionary")

    if not blip_description:
        logger.error("BLIP description is empty")
        raise ValueError("BLIP description cannot be empty")

    try:
        # Create prompt for Llama 3 8B
        prompt = f"""You are a creative pet adoption assistant. Create a unique and engaging pet profile based on the following information:
            Pet Name: {pet_data.get('name')}
            Animal Breed: {', '.join(pet_data.get('animal_breed', []))}
            Age: {pet_data.get('age')} years
            Gender: {pet_data.get('gender')}
            Weight: {pet_data.get('weight_kg')} kg
            Image Description: {blip_description}
            Brief Description: {pet_data.get('brief_description')}
            Sterilized: {'Yes' if pet_data.get('is_sterilized') else 'No'}
            Dewormed: {'Yes' if pet_data.get('dewormed') else 'No'}
            Vaccines: {', '.join(pet_data.get('vaccines_up_to_date', []))}
            Special Conditions: {', '.join(pet_data.get('special_conditions', [])) if pet_data.get('special_conditions') else 'None'}

            CRITICAL: The IMAGE DESCRIPTION and BRIEF DESCRIPTION are your PRIMARY sources for creating variety and uniqueness. Use specific details from both descriptions (colors, expressions, setting, actions, mood, personality traits) to make each profile completely different from others. Even pets with similar basic data should have vastly different profiles based on their unique descriptions.

            IMPORTANT: Create a COHERENT profile that GENERALIZES characteristics from the basic data and descriptions. DO NOT include specific basic data (exact age, weight, sterilization status, vaccines) in title or tags - those details will be in a separate "more info" section. Instead, focus on personality, appearance, and emotional traits that make this pet special.

            CRITICAL FOR EMOTIONAL DESCRIPTION: AVOID mentioning data that can change over time such as:
            - Specific age (e.g., "2 years old", "young puppy")
            - Specific weight (e.g., "5 kg", "small dog")
            - Sterilization status (e.g., "already neutered", "spayed")
            - Medical status (e.g., "up to date on vaccines", "dewormed")
            
            INSTEAD, focus on PERMANENT characteristics and preferences:
            - Environment preferences (loves being indoors, enjoys garden walks, prefers cozy home, outdoor explorer)
            - Personality traits (gentle, playful, calm, energetic, affectionate, independent)
            - Behavioral patterns (enjoys cuddling, likes to explore, prefers quiet spaces, active companion)
            - Physical traits from image (fluffy, spotted, golden, expressive eyes, elegant appearance)
            - Emotional connection needs (loves attention, independent spirit, loyal companion)

            Create a unique profile with:

            1. TITLE: MUST include the pet's name followed by a generalized description of their essence based on IMAGE DETAILS, BRIEF DESCRIPTION, and characteristics. Be creative and vary the style each time. Examples: "Buddy: The Young Adventure Companion", "Luna: Your Gentle Cuddle Expert", "Max: The Playful Guardian Ready for Love", "Bella: The Elegant Senior Lady", "Rocky: The Brave Explorer", "Daisy: The Sunshine Sweetheart"

            2. TAGS: 4-6 intelligent hashtags that GENERALIZE characteristics from IMAGE, BRIEF DESCRIPTION, and basic data:
            - Extract specific traits from image and brief descriptions (#Fluffy, #Spotted, #Golden, #ExpressiveEyes)
            - Generalize energy level from descriptions (#EnergeticSpirit, #CalmCompanion, #Playful, #GentleSoul)
            - Generalize size/appearance from image (#SmallAndSweet, #FluffyFriend, #Elegant, #Majestic)
            - Personality traits from brief description (#Playful, #GentleSoul, #Adventurous, #LoyalCompanion)
            - Environment preferences from image (#IndoorLover, #OutdoorExplorer, #GardenFan, #HomeBody)
            - Always include: #Adoptable #ReadyForHome
            Make tags reflect the pet's personality and appearance, not their medical status.

            3. EMOTIONAL DESCRIPTION: A heartfelt, unique description (80-120 words) that:
            - Uses the pet's name naturally
            - Heavily incorporates SPECIFIC details from both image and brief descriptions (colors, expressions, setting, actions, personality traits)
            - Describes their personality and appearance based on descriptions and characteristics
            - Creates emotional connection making readers feel they NEED to meet this pet
            - Different from any other pet profile - vary the tone, focus, and storytelling approach
            - Focus on what makes THIS specific pet special based on their unique descriptions
            - AVOID mentioning specific age, weight, sterilization status, or medical details
            - FOCUS on permanent traits: environment preferences (indoor/outdoor), personality, behavioral patterns, physical appearance
            - IMPORTANT: If the image shows indoor/home-related elements (furniture, carpets, windows, living room, bedroom, etc.), describe that they enjoy spending time at home and are comfortable indoors. If the image shows outdoor elements (grass, trees, parks, streets, nature, etc.), describe that they enjoy spending time outdoors and love exploring outside.

            You MUST respond ONLY with a JSON object with the following structure:
            {{
                "title": "a catchy title for the profile",
                "tags": ["#tag1", "#tag2", "#tag3", "#tag4"],
                "emotional_description": "a heartfelt description"
            }}
            """

        # Log the prompt for debugging
        logger.info(f"Sending prompt to Llama 3 8B (length: {len(prompt)} chars)")

        # Generate response using chat_completion
        messages = [{"role": "user", "content": prompt}]
        result = llama_client.chat_completion(
            messages,
            max_tokens=500,
            temperature=0.3,
        )

        # Access the content
        content = result.choices[0].message.content

        # Log the raw content for debugging
        logger.info(f"Raw response from Llama 3 8B: {content}")

        # Parse JSON response
        try:
            # Intentamos encontrar el JSON si el modelo puso texto antes
            if content is None:
                raise ValueError("Llama 3 8B returned None content")
            json_start = content.find("{")
            json_end = content.rfind("}") + 1

            if json_start != -1 and json_end != -1:
                json_str = content[json_start:json_end]
                enriched_data = json.loads(json_str)
            else:
                raise ValueError("No se encontró un bloque JSON en la respuesta")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            logger.error(f"Response content: {content}")
            raise ValueError(f"Invalid JSON format in Llama 3 8B response: {str(e)}")

        logger.info("Llama 3 8B enrichment completed successfully")
        return enriched_data
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON response: {str(e)}")
        raise ValueError(f"Invalid JSON format in Llama 3 8B response: {str(e)}")
    except Exception as e:
        logger.error(f"Failed to enrich profile with Llama 3 8B: {str(e)}")
        raise Exception("Failed to enrich profile")
