from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.config import settings
from app.routes.auth_routes import router as auth_router
from app.routes.admin_routes import router as admin_router
from app.routes.adopter_routes import router as adopter_router
from app.routes.backblaze_routes import router as backblaze_router
from app.routes.pet_routes import router as pet_router
from app.routes.adoption_form_routes import router as adoption_form_router

# Logger import
from app.utils.logger.logger_config import logger

logger.info("Initializing FastAPI application")
app = FastAPI()

# Session middleware for OAuth
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)
logger.info("Session middleware configured")

# CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info("CORS middleware configured")

# Include authentication routes
app.include_router(auth_router)
logger.info("Authentication routes registered")
# Include admin routes
app.include_router(admin_router)
logger.info("Admin routes registered")
# Include adopter routes
app.include_router(adopter_router)
logger.info("Adopter routes registered")
# Include backblaze routes
app.include_router(backblaze_router)
logger.info("Backblaze routes registered")
# Include pet routes
app.include_router(pet_router)
logger.info("Pet routes registered")
# Include adoption form routes
app.include_router(adoption_form_router)
logger.info("Adoption form routes registered")

logger.info("FastAPI application initialized successfully")


# Middleware to log incoming requests
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Log specifically when accessing /docs
        if request.url.path == "/docs":
            logger.info("User accessing FastAPI documentation")
        response = await call_next(request)
        return response


app.add_middleware(RequestLoggingMiddleware)


@app.get("/")
def read_root():
    logger.debug("Root endpoint accessed")
    return {"Hello": "World"}


@app.get("/health", tags=["Health"])
async def health_check():
    logger.debug("Health check endpoint accessed")
    return {"status": "ok"}
