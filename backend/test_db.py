import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient


async def main():
    client = AsyncIOMotorClient("mongodb://mongo:27017/")
    db = client["smartadopt_qa"]
    pets = await db.pet_profiles.find().to_list(10)
    res = []
    for p in pets:
        res.append(
            {
                "_id": p["_id"],
                "pet_image_url": p.get("pet", {}).get("pet_image_url"),
                "status": p.get("status"),
                "pet_keys": list(p.get("pet", {}).keys()),
            }
        )
    print(json.dumps(res, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
