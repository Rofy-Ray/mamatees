import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useHistory } from "react-router-dom";

function useProcessSquarePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const history = useHistory();

  const replacer = (key, value) =>
    typeof value === "bigint" ? value.toString() : value;

  const processSquarePayment = async (total, cardNonce, notes, cart ) => {
    setIsLoading(true);
    setError(null);

    try {
      const body = {
        idempotencyKey: uuidv4(),
        nonce: cardNonce,
        amountMoney: {
          amount: total * 100,
          currency: "USD",
        },
        note: notes,
        products: cart,
      };

      const headers = { "Content-Type": "application/json" };

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/processSquarePayment`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(body, replacer),
        }
      );

      const payment = await response.json();

      if (payment.error) {
        switch (payment.error.category) {
          case "AUTHENTICATION_ERROR":
            setError(
              "There was an issue with authentication. Please try again."
            );
            break;
          case "INVALID_REQUEST_ERROR":
            setError(
              "The request was invalid. Please check your information and try again."
            );
            break;
          case "RATE_LIMIT_ERROR":
            setError(
              "Too many requests have been made. Please wait a moment and try again."
            );
            break;
          case "API_ERROR":
            setError(
              "There was an issue with the payment gateway. Please try again later."
            );
            break;
          case "PAYMENT_METHOD_ERROR":
            setError(
              "There was an issue with the payment method. Please check your information and try again."
            );
            break;
          default:
            setError("An unknown error occurred. Please try again.");
        }
      } else {
        history.push("/success");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return [processSquarePayment, isLoading, error, setError];
}

export default useProcessSquarePayment;
