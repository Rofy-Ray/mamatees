import React, { useState, useEffect } from "react";
import {
  ListGroup,
  Button,
  CloseButton,
  Image,
  Row,
  Col,
  Form,
} from "react-bootstrap";
import { Trash } from "react-bootstrap-icons";
import { BsCreditCardFill, BsCashCoin } from "react-icons/bs";
import usePayCash from "../hooks/usePayCash";
import useWindowWidth from "../hooks/useWindowWidth";
import { useHistory } from "react-router-dom";

function Cart({ cart, updateQuantity, setShowCart }) {
  const windowWidth = useWindowWidth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [isSquareLoading, setIsSquareLoading] = useState(false);
  const [payCash, isCashLoading] = usePayCash();
  const [buttonText, setButtonText] = useState("");
  const history = useHistory();

  const total = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  useEffect(() => {
    if (total === 0) {
      setSelectedPaymentMethod(null);
      setButtonText("");
    }
  }, [total]);

  const fontSize = windowWidth <= 768 ? "larger" : "large";

  const startSquarePayment = () => {
    setIsSquareLoading(true);
    history.push({
      pathname: "/squarepayment",
      state: { total: total },
    });
  };

  return (
    <div
      className="cart"
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div className="cart">
        <CloseButton
          variant="white"
          aria-label="Hide"
          onClick={() => setShowCart(false)}
        />
        <h2>Your Plate</h2>
        <ListGroup variant="flush">
          {cart.map((item) => (
            <ListGroup.Item variant="light" key={item._id}>
              <Row className="align-items-center">
                <Col xs={3} md={2}>
                  <Image
                    src={item.image}
                    roundedCircle
                    width="50"
                    height="50"
                  />
                </Col>
                <Col xs={9} md={10} className="d-flex align-items-center">
                  <h5 className="mx-auto" style={{ fontSize: fontSize }}>
                    {item.name}
                  </h5>
                </Col>
              </Row>
              <Row className="align-items-center">
                <Col xs={4} className="d-flex align-items-center">
                  <p className="mb-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </Col>
                <Col xs={4} className="d-flex justify-content-center">
                  <Form.Control
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item._id, e.target.value)}
                    style={{ width: "60px" }}
                  />
                </Col>
                <Col xs={4} className="d-flex justify-content-end">
                  <Button
                    variant="danger"
                    onClick={() => updateQuantity(item._id, 0)}
                  >
                    <Trash />
                  </Button>
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
        <p
          style={{
            fontSize: "x-large",
            fontWeight: "bolder",
            color: "#10caf0",
            paddingTop: "15px",
          }}
        >
          Total: ${total.toFixed(2)}
        </p>
      </div>
      <div>
        <p>Select Payment Method</p>
        <BsCreditCardFill
          size={45}
          style={{
            color: selectedPaymentMethod === "Card" ? "#10caf0" : "white",
            marginRight: "25px",
            cursor: total === 0 ? "not-allowed" : "pointer",
          }}
          onClick={() => {
            if (total > 0) {
              setSelectedPaymentMethod("Card");
              setButtonText("Continue to Payment");
            }
          }}
        />
        <BsCashCoin
          size={45}
          style={{
            color: selectedPaymentMethod === "Cash" ? "#10caf0" : "white",
            cursor: total === 0 ? "not-allowed" : "pointer",
          }}
          onClick={() => {
            if (total > 0) {
              setSelectedPaymentMethod("Cash");
              setButtonText("Pay Cash on Pickup");
            }
          }}
        />
      </div>
      {selectedPaymentMethod && (
        <Button
          disabled={!selectedPaymentMethod || isSquareLoading || isCashLoading}
          style={{
            marginTop: "20px",
            backgroundColor: "black",
            fontWeight: "bold",
            border: "2px solid white",
          }}
          onClick={() => {
            if (selectedPaymentMethod === "Card") {
              startSquarePayment();
            } else if (selectedPaymentMethod === "Cash") {
              payCash(cart, history, "cash");
            }
          }}
        >
          {isSquareLoading || isCashLoading ? "Processing..." : buttonText}
        </Button>
      )}
    </div>
  );
}

export default Cart;
