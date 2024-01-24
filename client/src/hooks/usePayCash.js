import { useState } from "react";

function usePayCash() {
  const [isCashLoading, setIsCashLoading] = useState(false);

  const payCash = async (products, history, paymentMethod) => {
    setIsCashLoading(true);
    try {
      const body = {
        products: products,
      };

      const headers = { "Content-Type": "application/json" };

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/payCash`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(body),
        }
      );

      const order = await response.json();

      if (!response.ok) {
        console.error(order.error);
      } else {
        history.push("/success", { paymentMethod });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCashLoading(false);
    }
  };

  return [payCash, isCashLoading];
}

export default usePayCash;
