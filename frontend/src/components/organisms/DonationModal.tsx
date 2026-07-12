import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { apiClient as api } from "../../services/apiClient"; // Assuming api is your configured axios instance

// Load stripe lazily to avoid recreating Stripe object on every render and avoid showing the Stripe widget globally
let stripePromise: Promise<any> | null = null;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"
    );
  }
  return stripePromise;
};

interface CheckoutFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return; // Stripe.js hasn't yet loaded.
    }

    setIsProcessing(true);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL where the customer should be redirected after the PaymentIntent is confirmed.
        return_url: window.location.origin + "/#/adopter/dashboard",
      },
      redirect: "if_required", // Handle success on this page without redirect if possible
    });

    if (submitError) {
      setError(submitError.message || "An unexpected error occurred.");
      setIsProcessing(false);
    } else {
      // Payment successful
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      <DialogActions sx={{ mt: 3, px: 0 }}>
        <Button onClick={onCancel} disabled={isProcessing}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? <CircularProgress size={24} /> : "Donar"}
        </Button>
      </DialogActions>
    </form>
  );
};

interface DonationModalProps {
  open: boolean;
  onClose: () => void;
  amount: number; // Amount in dollars
}

export const DonationModal: React.FC<DonationModalProps> = ({
  open,
  onClose,
  amount,
}) => {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (open && amount > 0) {
      const createPaymentIntent = async () => {
        setIsLoading(true);
        setIsSuccess(false);
        try {
          const res = await api.post("/payments/create-payment-intent", {
            amount: amount * 100,
          });
          setClientSecret(res.data.clientSecret);
        } catch (err) {
          console.error("Error creating payment intent", err);
        } finally {
          setIsLoading(false);
        }
      };
      createPaymentIntent();
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClientSecret("");
    }
  }, [open, amount]);

  const handleSuccess = () => {
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Hacer una Donación</DialogTitle>
      <DialogContent>
        {isSuccess ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h5" color="success.main" gutterBottom>
              ¡Gracias por tu donación!
            </Typography>
            <Typography variant="body1">
              Tu aporte de ${amount} ayudará a muchos animales a encontrar un
              hogar.
            </Typography>
            <Button variant="contained" onClick={handleClose} sx={{ mt: 3 }}>
              Cerrar
            </Button>
          </Box>
        ) : (
          <>
            <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
              Estás a punto de donar <strong>${amount}.00</strong>. Completa tus
              datos de pago a continuación:
            </Typography>

            {isLoading && !clientSecret && (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {clientSecret && (
              <Elements stripe={getStripe()} options={{ clientSecret }}>
                <CheckoutForm
                  onSuccess={handleSuccess}
                  onCancel={handleClose}
                />
              </Elements>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
