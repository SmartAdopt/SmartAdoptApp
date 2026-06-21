# AI Service Tests

import pytest
from app.services.ai_service import describe_image_with_blip, enrich_profile_with_llama


@pytest.mark.asyncio
@pytest.mark.skip(reason="Requires real Hugging Face API and models")
async def test_describe_image_with_blip():
    """Test BLIP image description generation with eager loading."""
    # Models are loaded eagerly at startup, so they should be available immediately
    # Use a real publicly available image of a dog
    image_url = "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500"

    description = await describe_image_with_blip(image_url)

    assert description is not None
    assert isinstance(description, str)
    assert len(description) > 0
    # BLIP should generate a meaningful description (may contain "dog" or "pet")
    print(f"BLIP generated description: {description}")


@pytest.mark.asyncio
async def test_describe_image_with_blip_invalid_url():
    """Test BLIP with invalid URL should raise error."""
    image_url = ""

    with pytest.raises(ValueError, match="Image URL cannot be empty"):
        await describe_image_with_blip(image_url)


@pytest.mark.asyncio
async def test_describe_image_with_blip_non_https():
    """Test BLIP with non-HTTPS URL should raise error."""
    image_url = "http://example.com/test.jpg"

    with pytest.raises(ValueError, match="Image URL must start with https://"):
        await describe_image_with_blip(image_url)


@pytest.mark.asyncio
@pytest.mark.skip(reason="Requires real Hugging Face API and models")
async def test_enrich_profile_with_llama():
    """Test Llama 3 8B profile enrichment with eager loading."""
    # Models are loaded eagerly at startup, so they should be available immediately
    pet_data = {
        "name": "Max",
        "animal_breed": ["dog", "Golden Retriever"],
        "age": 3,
        "gender": "male",
        "weight_kg": 25.5,
        "is_sterilized": True,
        "dewormed": True,
        "vaccines_up_to_date": ["rabies", "parvovirus", "distemper"],
        "special_conditions": [],
        "brief_description": "Friendly dog looking for a home",
    }
    blip_description = "A pet animal looking friendly and adoptable"

    enriched_data = await enrich_profile_with_llama(pet_data, blip_description)

    assert enriched_data is not None
    assert isinstance(enriched_data, dict)
    assert "title" in enriched_data
    assert "tags" in enriched_data
    assert "emotional_description" in enriched_data

    # Verify title contains pet name
    assert pet_data["name"] in enriched_data["title"]

    # Verify tags is a list
    assert isinstance(enriched_data["tags"], list)
    assert len(enriched_data["tags"]) > 0

    # Verify emotional description contains pet name
    assert pet_data["name"] in enriched_data["emotional_description"]


@pytest.mark.asyncio
@pytest.mark.skip(reason="Requires real Hugging Face API and models")
async def test_enrich_profile_with_llama_missing_name():
    """Test Llama 3 8B enrichment with missing pet name."""
    pet_data = {
        "animal_breed": ["dog", "Mixed"],
        "age": 3,
        "gender": "male",
        "weight_kg": 25.5,
        "is_sterilized": True,
        "dewormed": True,
        "vaccines_up_to_date": ["rabies", "parvovirus", "distemper"],
        "special_conditions": [],
        "brief_description": "Friendly dog looking for a home",
    }
    blip_description = "A pet animal looking friendly and adoptable"

    enriched_data = await enrich_profile_with_llama(pet_data, blip_description)

    assert enriched_data is not None
    assert "title" in enriched_data
    # Model should generate a title even without name
    assert len(enriched_data["title"]) > 0


@pytest.mark.asyncio
@pytest.mark.skip(reason="Requires real Hugging Face API and models")
async def test_enrich_profile_with_llama_female_pet():
    """Test Llama 3 8B enrichment with female pet."""
    pet_data = {
        "name": "Luna",
        "animal_breed": ["cat", "Siamese"],
        "age": 2,
        "gender": "female",
        "weight_kg": 15.0,
        "is_sterilized": False,
        "dewormed": True,
        "vaccines_up_to_date": ["rabies", "feline triple"],
        "special_conditions": [],
        "brief_description": "Gentle cat looking for a loving home",
    }
    blip_description = "A pet animal looking friendly and adoptable"

    enriched_data = await enrich_profile_with_llama(pet_data, blip_description)

    assert enriched_data is not None
    assert "title" in enriched_data
    assert pet_data["name"] in enriched_data["title"]
    assert "she" in enriched_data["emotional_description"].lower()


@pytest.mark.asyncio
@pytest.mark.skip(reason="Requires real Hugging Face API and models")
async def test_enrich_profile_with_llama_special_conditions():
    """Test Llama 3 8B enrichment with special conditions."""
    pet_data = {
        "name": "Rocky",
        "animal_breed": ["dog", "German Shepherd"],
        "age": 5,
        "gender": "male",
        "weight_kg": 30.0,
        "is_sterilized": True,
        "dewormed": True,
        "vaccines_up_to_date": ["rabies", "parvovirus"],
        "special_conditions": ["Needs daily exercise", "Requires medication"],
        "brief_description": "Active dog looking for an experienced owner",
    }
    blip_description = "A pet animal looking friendly and adoptable"

    enriched_data = await enrich_profile_with_llama(pet_data, blip_description)

    assert enriched_data is not None
    assert "emotional_description" in enriched_data
    # Model should generate emotional description with pet name
    assert pet_data["name"] in enriched_data["emotional_description"]


@pytest.mark.asyncio
@pytest.mark.skip(reason="Requires real Hugging Face API and models")
async def test_ai_models_eager_loading():
    """Test that AI models are loaded eagerly at startup."""
    # Import the service to trigger eager loading
    from app.services.ai_service import (
        describe_image_with_blip,
        enrich_profile_with_llama,
    )

    # Models should be loaded immediately upon import
    # This test verifies eager loading by checking functions are callable
    assert callable(describe_image_with_blip)
    assert callable(enrich_profile_with_llama)

    # Test with a real image URL to verify models are loaded and working
    image_url = "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500"
    description = await describe_image_with_blip(image_url)
    assert description is not None
    assert isinstance(description, str)
    assert len(description) > 0
