import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

function useProcessStripePayment() {
  const [isLoading, setIsLoading] = useState(false);

  const processStripePayment = async (products) => {
    setIsLoading(true);
    try {
      const stripe = await loadStripe(
        process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
      );

      const body = {
        products: products,
      };

      const headers = { "Content-Type": "application/json" };

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/processStripePayment`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(body),
        }
      );

      const session = await response.json();

      const result = stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if ((await result).error) {
        console.log(result.error);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return [processStripePayment, isLoading];
}

export default useProcessStripePayment;
