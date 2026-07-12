from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import stripe
from app.config import settings
from app.utils.logger.logger_config import logger

router = APIRouter(prefix="/payments", tags=["Payments"])

# Set stripe API key from settings
stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentIntentRequest(BaseModel):
    amount: int  # Amount in cents (e.g., 1000 = $10.00)
    currency: str = "usd"


@router.post("/create-payment-intent")
async def create_payment_intent(request: PaymentIntentRequest):
    logger.info(
        f"Received request to create payment intent for amount: {request.amount}"
    )

    if not settings.STRIPE_SECRET_KEY or settings.STRIPE_SECRET_KEY == "":
        logger.error("STRIPE_SECRET_KEY is not set.")
        raise HTTPException(
            status_code=500, detail="Payment gateway configuration error."
        )

    try:
        # Create a PaymentIntent with the order amount and currency
        intent = stripe.PaymentIntent.create(
            amount=request.amount,
            currency=request.currency,
            # In the latest version of the API, specifying the `automatic_payment_methods`
            # parameter is optional because Stripe enables its functionality by default.
            automatic_payment_methods={
                "enabled": True,
            },
        )
        logger.info("Payment intent created successfully")
        return {"clientSecret": intent.client_secret}

    except stripe.error.StripeError as e:
        # Display a very generic error to the user, and maybe send
        # yourself an email
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"An unexpected error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
