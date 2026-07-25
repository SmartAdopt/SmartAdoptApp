from pymongo import MongoClient

# Conectar a MongoDB
client = MongoClient("mongodb://localhost:27017")
db = client["smartadopt"]  # Adjust database name if needed

# Colección de mascotas
pets_collection = db["pets"]

# Limpiar colección existente
pets_collection.delete_many({})

# Datos de ejemplo para mascotas
pets = []
species_options = ["dog", "cat"]
breeds_dog = ["Labrador", "Golden Retriever", "German Shepherd", "Bulldog", "Beagle", "Poodle", "Rottweiler", "Yorkshire Terrier"]
breeds_cat = ["Siamese", "Persian", "Maine Coon", "Ragdoll", "Bengal", "Sphynx", "Abyssinian", "British Shorthair"]
genders = ["male", "female"]
sizes = ["small", "medium", "large"]
energy_levels = ["low", "medium", "high"]
ages = ["puppy", "young", "adult", "senior"]

for i in range(1, 51):  # 50 mascotas
    species = species_options[i % 2]
    if species == "dog":
        breed = breeds_dog[i % len(breeds_dog)]
    else:
        breed = breeds_cat[i % len(breeds_cat)]
    
    pet = {
        "name": f"Mascota {i}",
        "species": species,
        "breed": breed,
        "gender": genders[i % 2],
        "size": sizes[i % 3],
        "energy_level": energy_levels[i % 3],
        "age": ages[i % 4],
        "description": f"Descripción de la mascota {i}",
        "age_months": (i * 3) % 120 + 6,
        "weight_kg": round(2 + (i * 1.5) % 30, 1),
        "sterilized": i % 2 == 0,
        "vaccinated": True,
        "dewormed": True,
        "microchip": f"MC{i:06d}",
        "status": "available",
        "foundation_id": 1,
        "photos": [
            f"https://example.com/pet_{i}_1.jpg",
            f"https://example.com/pet_{i}_2.jpg"
        ],
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z"
    }
    pets.append(pet)

# Insertar en MongoDB
result = pets_collection.insert_many(pets)
print(f"Insertados {len(result.inserted_ids)} mascotas en MongoDB")

# Verificar
count = pets_collection.count_documents({})
print(f"Total mascotas en BD: {count}")