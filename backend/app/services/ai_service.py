import json

import requests
from PIL import Image
from io import BytesIO
from transformers import BlipForConditionalGeneration, BlipProcessor
from typing import Dict, Any, List, Optional

from app.config import settings
from app.utils.logger.logger_config import logger

# Load BLIP models locally (image captioning)
logger.info("Loading BLIP models...")
blip_processor = BlipProcessor.from_pretrained(
    "Salesforce/blip-image-captioning-base"
)  # nosec B615
blip_model = BlipForConditionalGeneration.from_pretrained(
    "Salesforce/blip-image-captioning-base"
)  # nosec B615
logger.info("BLIP models loaded successfully")

# LLM (Llama) configuration - provider agnostic (Groq, HF router, ...).
# Switch provider via LLAMA_BASE_URL, switch model via LLAMA_MODEL.
LLAMA_BASE_URL = settings.LLAMA_BASE_URL.rstrip("/")
LLAMA_MODEL = settings.LLAMA_MODEL
LLAMA_API_KEY = settings.LLAMA_API_KEY


def _call_llama(
    messages: List[Dict[str, str]],
    max_tokens: int = 500,
    temperature: float = 0.3,
    retries: int = 2,
) -> str:
    # OpenAI-compatible chat completion. Works with Groq, HF router, ...).
    url = f"{LLAMA_BASE_URL}/chat/completions"
    headers = {"Content-Type": "application/json"}
    if LLAMA_API_KEY:
        headers["Authorization"] = f"Bearer {LLAMA_API_KEY}"
    payload = {
        "model": LLAMA_MODEL,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }
    # Request structured JSON output when the provider supports it (Groq/OpenAI)
    if settings.LLAMA_JSON_MODE:
        payload["response_format"] = {"type": "json_object"}

    last_err: Optional[Exception] = None
    for attempt in range(1, retries + 1):
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=90)
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            # Strip markdown code fences if the model wrapped the JSON
            if content.startswith("```"):
                content = content.split("```", 2)[1]
                if content.lower().startswith("json"):
                    content = content[4:]
            return content.strip()
        except Exception as e:  # noqa: BLE001
            last_err = e
            logger.warning(f"LLM call failed (attempt {attempt}/{retries}): {e}")
    raise last_err if last_err else RuntimeError("LLM call failed")


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
    logger.info("Enriching pet profile with the LLM")

    # Validate inputs
    if not pet_data:
        logger.error("Pet data is invalid")
        raise ValueError("Pet data must be a non-empty dictionary")

    if not blip_description:
        logger.error("BLIP description is empty")
        raise ValueError("BLIP description cannot be empty")

    try:
        # Build the LLM prompt
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
            Special Conditions: {', '.join(pet_data.get('special_conditions', []))if pet_data.get('special_conditions') else 'None'}

            IMPORTANT: All generated content (title, tags, emotional_description) MUST be written entirely in Spanish.

            CRITICAL: The IMAGE DESCRIPTION and BRIEF DESCRIPTION are your PRIMARY sources for creating variety and uniqueness. Use specific details from both descriptions (colors, expressions, setting, actions, mood, personality traits) to make each profile completely different from others. Even pets with similar basic data should have vastly different profiles based on their unique descriptions.

            IMPORTANT: DO NOT include specific basic data (exact age, weight, sterilization status, vaccines) in title, tags, or emotional description - those details will be in a separate "more info" section. Instead, focus on permanent traits: personality, appearance, environment preferences, and behavioral patterns that make this pet special.

            Create a unique profile with:

            1. TITLE: MUST include the pet's name followed by a generalized description of their essence based on IMAGE DETAILS, BRIEF DESCRIPTION, and characteristics. Be creative and vary the style each time. Examples: "Buddy: El Joven Compañero de Aventuras", "Luna: Tu Suave Experta en Mimos", "Max: El Guardián Juguetón Listo para Amar", "Bella: La Elegante Dama", "Rocky: El Valiente Explorador", "Daisy: La Dulce Rayo de Sol"

            2. TAGS: 4-6 intelligent hashtags that GENERALIZE characteristics from IMAGE, BRIEF DESCRIPTION, and basic data. All tags MUST be in Spanish:
            - Extract specific traits from image and brief descriptions (#Peludo, #Manchado, #Dorado, #OjosExpresivos)
            - Generalize energy level from descriptions (#EspírituEnergético, #CompañeroTranquilo, #Juguetón, #AlmaGentil)
            - Generalize size/appearance from image (#PequeñoYDulce, #AmigoPeludo, #Elegante, #Majestuoso)
            - Personality traits from brief description (#Juguetón, #AlmaGentil, #Aventurero, #CompañeroFiel)
            - Environment preferences from image (#AmanteDelHogar, #Explorador, #FanDelJardín, #Casero)

            - CRITICAL: Do NOT use any English words in tags. ALL tags MUST be 100% Spanish.
            Make tags reflect the pet's personality and appearance, not their medical status.

            3. EMOTIONAL DESCRIPTION: A heartfelt, unique description in Spanish (80-120 words) that:
            - Uses the pet's name naturally
            - Heavily incorporates SPECIFIC details from both image and brief descriptions (colors, expressions, setting, actions, personality traits)
            - Describes their personality and appearance based on descriptions and characteristics
            - Creates emotional connection making readers feel they NEED to meet this pet
            - Different from any other pet profile - vary the tone, focus, and storytelling approach
            - Focus on what makes THIS specific pet special based on their unique descriptions
            - AVOID mentioning specific age, weight, sterilization status, or medical details
            - FOCUS on permanent traits: environment preferences (indoor/outdoor), personality, behavioral patterns, physical appearance
            - IMPORTANT: If the image shows indoor/home-related elements (furniture, carpets, windows, living room, bedroom, etc.), describe that they enjoy spending time at home and are comfortable indoors. If the image shows outdoor elements (grass, trees, parks, streets, nature, etc.), describe that they enjoy spending time outdoors and love exploring outside.

            You MUST respond ONLY with a JSON object with the following structure. ALL string values MUST be in Spanish:
            {{
                "title": "a catchy title for the profile",
                "tags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4"],
                "emotional_description": "a heartfelt description"
            }}
        """

        # Log the prompt for debugging
        logger.info(f"Sending prompt to the LLM (length: {len(prompt)} chars)")

        # Generate response using the configured LLM provider
        messages = [{"role": "user", "content": prompt}]
        content = _call_llama(messages, max_tokens=800, temperature=0.3)

        # Log the raw content for debugging
        logger.info(f"Raw response from the LLM: {content}")

        # Parse JSON response
        try:
            # Intentamos encontrar el JSON si el modelo puso texto antes
            if content is None:
                raise ValueError("LLM returned None content")
            json_start = content.find("{")
            json_end = content.rfind("}") + 1

            if json_start != -1 and json_end != -1:
                json_str = content[json_start:json_end]
                enriched_data = json.loads(json_str)
                # Force-remove unwanted English tags
                if "tags" in enriched_data and isinstance(enriched_data["tags"], list):
                    enriched_data["tags"] = [
                        t
                        for t in enriched_data["tags"]
                        if t.strip().lower()
                        not in {
                            "#adoptable",
                            "#readyforhome",
                            "#readyforlove",
                            "#readytolove",
                        }
                    ]
            else:
                raise ValueError("No JSON block was found in the response")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            logger.error(f"Response content: {content}")
            raise ValueError(f"Invalid JSON format in LLM response: {str(e)}")

        logger.info("LLM enrichment completed successfully")
        return enriched_data
    except Exception as e:
        logger.error(f"Failed to enrich profile with the LLM: {str(e)}")
        raise Exception("Failed to enrich profile")


async def evaluate_adoption_application(
    form_data: Dict[str, Any], pet_data: Dict[str, Any]
) -> Dict[str, Any]:
    # Evaluate cross-compatibility between adopter form and pet data
    logger.info("Evaluating adoption application with the LLM")

    # Validate inputs
    if not form_data:
        logger.error("Form data is invalid")
        raise ValueError("Form data must be a non-empty dictionary")

    if not pet_data:
        logger.error("Pet data is invalid")
        raise ValueError("Pet data must be a non-empty dictionary")

    # Extract pet info from nested structure
    pet = pet_data.get("pet", {})
    if not pet:
        logger.error("Pet data missing 'pet' field")
        raise ValueError("Pet data must contain a 'pet' field")

    try:
        # Sanitize form values to avoid breaking JSON in prompt
        def _safe(val):
            if val is None:
                return ""
            return str(val).replace('"', "'").replace("\n", " ").replace("\r", " ")

        # Build a compact representation of form data for the prompt
        pet_info = {
            "name": pet.get("name"),
            "species": (
                pet.get("animal_breed", [None, None])[0]
                if pet.get("animal_breed")
                else None
            ),
            "breed": (
                pet.get("animal_breed", [None, None])[1]
                if pet.get("animal_breed") and len(pet.get("animal_breed", [])) > 1
                else None
            ),
            "age": pet.get("age"),
            "gender": pet.get("gender"),
            "weight_kg": pet.get("weight_kg"),
            "sterilized": pet.get("is_sterilized"),
            "dewormed": pet.get("dewormed"),
            "vaccines": pet.get("vaccines_up_to_date", []),
            "special_conditions": pet.get("special_conditions", []),
            "brief_description": pet.get("brief_description"),
            "title": pet_data.get("title"),
            "emotional_description": pet_data.get("emotional_description"),
        }

        # Build the LLM prompt
        prompt = f"""You are an adoption compatibility evaluator. Your task is to evaluate whether an adopter is compatible with a specific pet based on the adopter's form and the pet's profile.

    IMPORTANT: The evaluation and justification text fields MUST be written entirely in Spanish.

    ADOPTER FORM DATA:
    - Neighborhood: {form_data.get('neighborhood')}
    - Employment Status: {form_data.get('employment_status')} {f"({form_data.get('employment_status_other')})" if form_data.get('employment_status_other') else ''}
    - Housing Type: {form_data.get('housing_type')} {f"({form_data.get('housing_type_other')})" if form_data.get('housing_type_other') else ''}
    - Has Natural Space: {'Yes' if form_data.get('has_natural_space') else 'No'}
    - Currently Has Pets: {'Yes' if form_data.get('has_pets') else 'No'} {f"- Details: {form_data.get('current_pets_details')}" if form_data.get('current_pets_details') else ''}
    - Household Energy Level: {form_data.get('household_energy')}
    - Has Children: {'Yes' if form_data.get('has_children') else 'No'} {f"- Ages: {form_data.get('children_ages')}" if form_data.get('children_ages') else ''}
    - Long Term Commitment: {'Yes' if form_data.get('long_term_commitment') else 'No'}
    - Preferred Species: {form_data.get('preferred_species')}
    - Preferred Gender: {form_data.get('preferred_gender')}
    - Preferred Energy Level: {form_data.get('preferred_energy')}
    - Daily Time Dedication: {form_data.get('daily_time_dedication')} hours
    - Sleeping Location: {form_data.get('sleeping_location')} {f"({form_data.get('sleeping_location_other')})" if form_data.get('sleeping_location_other') else ''}
    - Behavior Approach: {form_data.get('behavior_approach')} {f"({form_data.get('behavior_approach_other')})" if form_data.get('behavior_approach_other') else ''}
    - Emergency Plan: {form_data.get('emergency_plan')} {f"({form_data.get('emergency_plan_other')})" if form_data.get('emergency_plan_other') else ''}
    - Motivation: {form_data.get('motivation')}

    PET PROFILE DATA:
    - Name: {pet_info['name']}
    - Species: {pet_info['species']}
    - Breed: {pet_info['breed']}
    - Age: {pet_info['age']} years
    - Gender: {pet_info['gender']}
    - Weight: {pet_info['weight_kg']} kg
    - Sterilized: {'Yes' if pet_info['sterilized'] else 'No'}
    - Special Conditions: {', '.join(pet_info['special_conditions']) if pet_info['special_conditions'] else 'None'}
    - Brief Description: {pet_info['brief_description']}
    - Profile Title: {pet_info['title']}
    - Emotional Description: {pet_info['emotional_description']}

    For each field, evaluate cross-compatibility between the adopter's response and this specific pet's profile. Score each field 1 (compatible) or 0 (not compatible).

    CRITICAL: Be STRICT and DEMANDING. Not everything should be compatible. Only score 1 when there's clear evidence of compatibility. Score 0 if there's any reasonable doubt or mismatch. A score of 15/15 is almost never realistic - real adopters have weaknesses.

    Specifically consider this pet's needs based on its species, breed, age, weight, special conditions, and description. A mismatch in any area should result in 0.

    SECTION I - CANDIDATE INFORMATION:
    1. employment_status: Score 0 if the adopter's job leaves little time for this specific pet's needs (e.g., a high-energy dog needs more time than a cat).
    2. housing_type: Score 0 if the housing is too small or restrictive for this pet's size and energy level (e.g., a large dog in a small apartment without outdoor access).
    3. has_natural_space: Score 0 if the pet clearly needs outdoor space and the adopter doesn't have it (e.g., a high-energy breed without a yard).

    SECTION II - COEXISTENCE AND EXPERIENCE:
    4. has_pets: Score 0 if introducing this specific pet to existing pets could be problematic (e.g., same gender aggression, territorial breeds).
    5. household_energy: Score 0 if the household energy level conflicts with this pet's temperament (e.g., a high-anxiety pet in a very active household).
    6. has_children: Score 0 if the pet's temperament or special conditions are incompatible with children of those ages.
    7. long_term_commitment: Score 0 if the adopter doesn't fully understand the long-term commitment this specific pet requires.

    SECTION III - PET PREFERENCES:
    8. preferred_species: Score 0 if the species doesn't match and the adopter didn't say no_preference.
    9. preferred_gender: Score 0 if the gender doesn't match and the adopter didn't say no_preference.
    10. preferred_energy: Score 0 if the pet's energy level clearly differs from what the adopter prefers.

    SECTION V - MOTIVATION:
    11. motivation: Score 0 if the motivation seems generic, superficial, or doesn't address this specific pet's known needs (based on breed, special conditions, etc.).

    SECTION IV - LOGISTICS AND EDUCATION:
    12. daily_time_dedication: Score 0 if the adopter's available time is insufficient for this specific pet's care requirements.
    13. sleeping_location: Score 0 if the planned sleeping location is inappropriate for this pet's needs.
    14. behavior_approach: Score 0 if the adopter's approach is unlikely to work well with this pet's likely behavioral traits.
    15. emergency_plan: Score 0 if the emergency plan is unrealistic or doesn't consider this pet's specific needs.

    IMPORTANT: Do NOT include any numeric scores, fractions (e.g. "4/15"), or quantitative ratings in the justification text. The scores are displayed separately.

    IMPORTANT FOR EVALUATION FIELD: When points=1 (compatible), the evaluation text MUST be exactly "Compatible". Only write a brief explanation in Spanish when points=0 (not compatible), describing why it's incompatible.

    You MUST respond ONLY with a JSON object with the following structure:
    {{
    "total_score": integer (sum of ALL compatible fields, 0-15),
    "total_max_score": 15,
    "main_score": integer (sum of compatible main fields from sections I, II, III, V, 0-11),
    "main_max_score": 11,
    "logistics_education_score": integer (sum of compatible logistics fields from section IV, 0-4),
    "logistics_education_max_score": 4,
    "breakdown": [
        {{"section": "I. Candidate Information", "field": "employment_status", "label": "Employment Status", "answer": "{_safe(form_data.get('employment_status'))}","evaluation": "Compatible", "points": 1, "max_points": 1}},
        {{"section": "I. Candidate Information", "field": "housing_type", "label": "Housing Type", "answer": "{_safe(form_data.get('housing_type'))}", "evaluation": "Compatible", "points": 1, "max_points": 1}},
        {{"section": "I. Candidate Information", "field": "has_natural_space", "label": "Has Natural Space", "answer": "{'Yes' if form_data.get('has_natural_space') else 'No'}", "evaluation": "...", "points": 0 or 1, "max_points": 1}},
        {{"section": "II. Coexistence and Experience", "field": "has_pets", "label": "Has Pets", "answer": "{'Yes' if form_data.get('has_pets') else 'No'}", "evaluation": "...", "points": 0 or 1, "max_points": 1}},
        {{"section": "II. Coexistence and Experience", "field": "household_energy", "label": "Household Energy", "answer": "{_safe(form_data.get('household_energy'))}", "evaluation": "...", "points": 0 or 1, "max_points": 1}},
        {{"section": "II. Coexistence and Experience", "field": "has_children", "label": "Has Children", "answer": "{'Yes' if form_data.get('has_children') else 'No'}", "evaluation": "...", "points": 0 or 1, "max_points": 1}},
        {{"section": "II. Coexistence and Experience", "field": "long_term_commitment", "label": "Long Term Commitment", "answer": "{'Yes' if form_data.get('long_term_commitment') else 'No'}", "evaluation": "...", "points": 0 or 1, "max_points": 1}},
        {{"section": "III. Pet Preferences", "field": "preferred_species", "label": "Preferred Species", "answer": "{_safe(form_data.get('preferred_species'))}", "evaluation": "...", "points": 0 or 1, "max_points": 1}},
        {{"section": "III. Pet Preferences", "field": "preferred_gender", "label": "Preferred Gender", "answer": "{_safe(form_data.get('preferred_gender'))}", "evaluation": "...", "points": 0 or 1, "max_points": 1}},
        {{"section": "III. Pet Preferences", "field": "preferred_energy", "label": "Preferred Energy", "answer": "{_safe(form_data.get('preferred_energy'))}", "evaluation": "...", "points": 0 or 1, "max_points": 1}},
        {{"section": "V. Motivation", "field": "motivation", "label": "Motivation", "answer": "{_safe(form_data.get('motivation'))[:80]}...", "evaluation": "...", "points": 0 or 1, "max_points": 1}},
        {{"section": "IV. Logistics and Education", "field": "daily_time_dedication", "label": "Daily Time Dedication", "answer": "{_safe(form_data.get('daily_time_dedication'))} hours", "evaluation": "...", "points": 0 or 1, "max_points": 1}},
        {{"section": "IV. Logistics and Education", "field": "sleeping_location", "label": "Sleeping Location", "answer": "{_safe(form_data.get('sleeping_location'))}", "evaluation": "...", "points": 0 or 1, "max_points": 1}},
        {{"section": "IV. Logistics and Education", "field": "behavior_approach", "label": "Behavior Approach", "answer": "{_safe(form_data.get('behavior_approach'))}", "evaluation": "...", "points": 0 or 1, "max_points": 1}},
        {{"section": "IV. Logistics and Education", "field": "emergency_plan", "label": "Emergency Plan", "answer": "{_safe(form_data.get('emergency_plan'))}", "evaluation": "...", "points": 0 or 1, "max_points": 1}}
    ],
    "justification": "A detailed justification written in Spanish explaining the overall compatibility evaluation, highlighting the key matches and concerns found in the analysis".
    """

        # Log the prompt for debugging
        logger.info(
            f"Sending evaluation prompt to the LLM (length: {len(prompt)} chars)"
        )

        # Generate response using the configured LLM provider
        messages = [{"role": "user", "content": prompt}]
        content = _call_llama(messages, max_tokens=2500, temperature=0.3)

        # Log the raw content for debugging
        logger.info(f"Raw evaluation response from the LLM: {content}")

        # Extract JSON from response using brace depth tracking
        try:
            if content is None:
                raise ValueError("LLM returned None content")

            json_start = content.find("{")

            if json_start == -1:
                raise ValueError("No JSON block found in response")

            # Track brace depth to find matching closing brace
            depth = 0
            json_end = -1
            in_string = False
            escape = False
            for i in range(json_start, len(content)):
                ch = content[i]
                if in_string:
                    if escape:
                        escape = False
                    elif ch == "\\":
                        escape = True
                    elif ch == '"':
                        in_string = False
                else:
                    if ch == '"':
                        in_string = True
                    elif ch == "{":
                        depth += 1
                    elif ch == "}":
                        depth -= 1
                        if depth == 0:
                            json_end = i + 1
                            break

            if json_end == -1:
                raise ValueError("No matching closing brace found in response")

            json_str = content[json_start:json_end]
            evaluation_data = json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            logger.error(f"Response content: {content}")
            raise ValueError(f"Invalid JSON format in LLM response: {str(e)}")

        # Validate required fields in response
        required_fields = [
            "total_score",
            "total_max_score",
            "main_score",
            "main_max_score",
            "logistics_education_score",
            "logistics_education_max_score",
            "breakdown",
            "justification",
        ]
        for field in required_fields:
            if field not in evaluation_data:
                logger.error(f"Missing required field '{field}' in Llama response")
                raise ValueError(f"AI response missing required field: {field}")

        # Validate breakdown is a list with 15 items
        if not isinstance(evaluation_data["breakdown"], list):
            logger.error("Breakdown is not a list")
            raise ValueError("AI response breakdown must be a list")

        if len(evaluation_data["breakdown"]) != 15:
            logger.warning(
                f"Breakdown has {len(evaluation_data['breakdown'])} items, expected 15 - padding with defaults"
            )
            # If AI returns fewer than 15 items, pad with defaults (points=0)
            while len(evaluation_data["breakdown"]) < 15:
                idx = len(evaluation_data["breakdown"]) + 1
                evaluation_data["breakdown"].append(
                    {
                        "section": "Unavailable",
                        "field": f"field_{idx}",
                        "label": f"Field {idx}",
                        "answer": "Not evaluated",
                        "evaluation": "AI did not evaluate this field",
                        "points": 0,
                        "max_points": 1,
                    }
                )
            # If more than 15, truncate
            evaluation_data["breakdown"] = evaluation_data["breakdown"][:15]

        # Recalculate scores from breakdown points (AI can't sum reliably)
        main_fields = evaluation_data["breakdown"][:11]
        logistics_fields = evaluation_data["breakdown"][11:15]

        calculated_main = sum(item.get("points", 0) for item in main_fields)
        calculated_logistics = sum(item.get("points", 0) for item in logistics_fields)
        calculated_total = calculated_main + calculated_logistics

        evaluation_data["main_score"] = calculated_main
        evaluation_data["logistics_education_score"] = calculated_logistics
        evaluation_data["total_score"] = calculated_total

        logger.info(
            f"Scores recalculated from breakdown - total: {calculated_total}/15, "
            f"main: {calculated_main}/11, logistics: {calculated_logistics}/4"
        )

        # Validate each breakdown item has required fields
        for item in evaluation_data["breakdown"]:
            item_fields = [
                "section",
                "field",
                "label",
                "answer",
                "evaluation",
                "points",
                "max_points",
            ]
            for field in item_fields:
                if field not in item:
                    logger.warning(f"Breakdown item missing field '{field}'")
                    item[field] = (
                        "" if field != "points" and field != "max_points" else 0
                    )

        logger.info("Adoption application evaluation completed successfully")
        return evaluation_data
    except Exception as e:
        logger.error(f"Failed to evaluate adoption application: {str(e)}")
        raise Exception("Failed to evaluate adoption application")
