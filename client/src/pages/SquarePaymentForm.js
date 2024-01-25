import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import useProcessSquarePayment from "../hooks/useProcessSquarePayment";
import useExternalScripts from "../hooks/useExternalScripts";

function SquarePaymentForm() {
  const location = useLocation();
  const total = location.state.total;
  const [processSquarePayment, isLoading, error, setError] =
    useProcessSquarePayment();
  const [card, setCard] = useState(null);
  const scriptLoaded = useExternalScripts({
    url:
      process.env.NODE_ENV === "production"
        ? "https://web.squarecdn.com/v1/square.js"
        : "https://sandbox.web.squarecdn.com/v1/square.js",
  });

  const handleCardNonce = useCallback(async () => {
    const result = await card.tokenize();
    if (result.status === "OK") {
      processSquarePayment(total, result.token);
    } else {
      setError(
        "Failed to tokenize card. Please check your card details and try again."
      );
    }
  }, [card, processSquarePayment, total, setError]);

  useEffect(() => {
    const initializeCard = async () => {
      if (window.Square) {
        const payments = window.Square.payments(
          process.env.REACT_APP_SQUARE_APPLICATION_ID,
          process.env.REACT_APP_SQUARE_LOCATION_ID
        );
        const card = await payments.card({
          style: {
            ".message-text": {
              color: "white",
            },
            ".message-icon": {
              color: "white",
            },
          },
        });
        await card.attach("#card-container");
        setCard(card);
      }
    };

    if (window.Square && scriptLoaded) {
      initializeCard();
    }
  }, [scriptLoaded]);

  return (
    <div id="form-wrapper">
      <div id="payment-form">
        <div id="card-container"></div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button
          id="card-button"
          type="button"
          onClick={handleCardNonce}
          disabled={isLoading}
        >
          {isLoading ? "Processing Payment..." : "Pay"}
        </button>
      </div>
    </div>
  );
}

export default SquarePaymentForm;
