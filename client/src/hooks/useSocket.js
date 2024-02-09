import { useEffect } from "react";
import io from "socket.io-client";

function useSocket(setOrders, handleSquarePaymentCompleted) {
  useEffect(() => {
    const socket = io(`${process.env.REACT_APP_SERVER_URL}`);

    socket.on("connect", () => {

      socket.on("squarePaymentCompleted", (data) => {
        handleSquarePaymentCompleted(data);
      });

      socket.on("newOrder", (order) => {
        if (order && order.products) {
          setOrders((prevOrders) => {
            const updatedOrders = [...prevOrders, order];
            localStorage.setItem(
              "MAMA_TEES_ORDERS",
              JSON.stringify(updatedOrders)
            );
            return updatedOrders;
          });
        }
      });

      socket.on("connect_error", (err) => {
        console.error(`connect_error due to ${err.message}`);
      });
    });

    return () => {
      socket.off("newOrder");
      socket.off("squarePaymentCompleted");
      socket.off("connect_error");
      socket.close();
    };
  }, [setOrders, handleSquarePaymentCompleted]);
}

export default useSocket;
