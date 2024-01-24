import React, { useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { CheckCircle } from "react-bootstrap-icons";
import { Link, useHistory, useLocation } from "react-router-dom";

function SuccessCard() {
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    setTimeout(() => {
      history.push("/");
    }, 5000);
  }, [history]);

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "calc(100vh - 120px)" }}
    >
      <Card className="text-center" style={{ borderRadius: "25px" }}>
        <Card.Body>
          <CheckCircle size={60} className="mb-4" />
          <Card.Title style={{ fontWeight: "bolder" }}>
            {location.state && location.state.paymentMethod === "cash"
              ? "Order Placed!"
              : "Payment Successful!"}
          </Card.Title>
          <Card.Text>
            {location.state && location.state.paymentMethod === "cash"
              ? "Pay for your food when you pick up."
              : "Your payment has been processed successfully."}
          </Card.Text>
          <Link to="/">
            <Button
              style={{
                borderRadius: "25px",
                backgroundColor: "green",
                borderColor: "black",
              }}
            >
              Get More Food
            </Button>
          </Link>
        </Card.Body>
      </Card>
    </div>
  );
}

export default SuccessCard;
