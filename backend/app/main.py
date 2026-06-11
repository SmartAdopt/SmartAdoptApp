from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.config import settings
from app.routes.auth_routes import router as auth_router
from app.routes.admin_routes import router as admin_router
from app.routes.adopter_routes import router as adopter_router

app = FastAPI()

# Session middleware for OAuth
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication routes
app.include_router(auth_router)
# Include admin routes
app.include_router(admin_router)
# Include adopter routes
app.include_router(adopter_router)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}
