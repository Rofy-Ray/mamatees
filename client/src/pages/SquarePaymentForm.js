import React, { useEffect, useState, useCallback } from "react";
import { Button, Alert } from "react-bootstrap";
import { useLocation, useHistory } from "react-router-dom";
import useProcessSquarePayment from "../hooks/useProcessSquarePayment";
import useExternalScripts from "../hooks/useExternalScripts";
import useSocket from "../hooks/useSocket";

function SquarePaymentForm() {
  const location = useLocation();
  const total = location.state.total;
  const notes = location.state.notes;
  const cart = location.state.cart;
  const [processSquarePayment, isLoading, error, setError] =
    useProcessSquarePayment();
  const [card, setCard] = useState(null);
  const scriptLoaded = useExternalScripts({
    url:
      process.env.NODE_ENV === "production"
        ? "https://web.squarecdn.com/v1/square.js"
        : "https://sandbox.web.squarecdn.com/v1/square.js",
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isLoadingTerminal, setIsLoadingTerminal] = useState(false);
  const [checkout, setCheckout] = useState(null);
  const setOrders = useState([])[1];
  const history = useHistory();

  const sendSquarePayment = async () => {
    setIsLoadingTerminal(true);
    const response = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/api/createCheckout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total: total, notes: notes, products: cart }),
      }
    );
    if (!response.ok) {
      console.error("Failed to create checkout");
      return;
    }
    const data = await response.json();
    const body = JSON.parse(data.body);
    const checkout = body.checkout;
    setCheckout(checkout);
    if (!checkout || !checkout.id) {
      console.error("Invalid checkout: ", checkout);
      setIsLoadingTerminal(false);
      return;
    }
    // window.location.href = `square-terminal://v1/connect?checkout_id=${checkout.id}`;
  };

  const handleSquarePaymentCompleted = useCallback(
    (data) => {
      if (!checkout) {
        console.error("Checkout object is undefined.");
      }
      if (!data.checkoutId) {
        console.error("data.checkoutId is undefined.");
      }
      if (checkout && data.checkoutId === checkout.id) {
        setIsLoadingTerminal(false);
        history.push("/success");
      } else {
        console.error("Checkout IDs do not match.");
      }
    },
    [checkout, setIsLoadingTerminal, history]
  );

  useSocket(setOrders, handleSquarePaymentCompleted);

  const handleCardNonce = useCallback(async () => {
    const result = await card.tokenize();
    if (result.status === "OK") {
      processSquarePayment(total, result.token, notes, cart);
    } else {
      setError(
        "Failed to tokenize card. Please check your card details and try again."
      );
    }
  }, [card, processSquarePayment, total, notes, cart, setError]);

  const initializeCard = async () => {
    if (window.Square) {
      const payments = window.Square.payments(
        process.env.NODE_ENV === "production"
          ? process.env.REACT_APP_SQUARE_APPLICATION_ID
          : process.env.REACT_APP_SQUARE_SANDBOX_APPLICATION_ID,
        process.env.NODE_ENV === "production"
          ? process.env.REACT_APP_SQUARE_LOCATION_ID
          : process.env.REACT_APP_SQUARE_SANDBOX_LOCATION_ID
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

  useEffect(() => {
    if (window.Square && scriptLoaded && showPaymentForm && !card) {
      initializeCard();
    }
  }, [scriptLoaded, showPaymentForm, card]);

  const togglePaymentForm = () => {
    setShowPaymentForm(!showPaymentForm);
  };

  return (
    <div>
      {showPaymentForm ? (
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
      ) : (
        <div className="d-flex flex-column align-items-center justify-content-center vh-100">
          {isLoadingTerminal && (
            <Alert variant="info" className="mb-3 w-25">
              Complete Payment on the Terminal...
            </Alert>
          )}
          <Button
            variant="info"
            className="mb-3 w-25"
            onClick={sendSquarePayment}
            disabled={isLoadingTerminal}
          >
            {isLoadingTerminal ? "Processing..." : "Pay with Square Terminal"}
          </Button>
          <Button
            variant="secondary"
            className="w-25"
            onClick={togglePaymentForm}
            disabled={isLoadingTerminal}
          >
            Enter Card Details
          </Button>
        </div>
      )}
    </div>
  );
}

export default SquarePaymentForm;
