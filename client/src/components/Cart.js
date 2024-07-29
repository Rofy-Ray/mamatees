import React, { useState, useEffect } from "react";
import {
  ListGroup,
  Button,
  ButtonGroup,
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

function Cart({ cart, updateQuantity, setShowCart, setNotes, notes, removeItem }) {
  const windowWidth = useWindowWidth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [isSquareLoading, setIsSquareLoading] = useState(false);
  const [payCash, isCashLoading] = usePayCash();
  const [buttonText, setButtonText] = useState("");
  const history = useHistory();

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(item._id, newQuantity, item.isMeal);
    }
  };

  const handleRemoveItem = (item) => {
    removeItem(item._id, item.isMeal);
  };

  const subTotal = cart.reduce(
    (subTotal, item) => subTotal + item.price * item.quantity,
    0
  );

  const salesTax = subTotal * 0.0675;

  const total = Math.round((subTotal + salesTax) * 100) / 100;

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
      state: { total: total, notes: notes, cart: cart },
    });
  };

  const getMealText = (item) => {
    if (item.type === "beverage") {
      return item.isMeal ? "(Refill)" : "(Main Cup)";
    }
    return item.isMeal ? "(Meal)" : "(Sandwich)";
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
            <ListGroup.Item variant="light" key={item._id + item.isMeal}>
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
                  {item.name} {getMealText(item)}
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
                <ButtonGroup>
                    <Button
                      onClick={() => handleQuantityChange(item, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </Button>
                  <Form.Control
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item, parseInt(e.target.value, 10))}
                    style={{ width: "60px" }}
                  />
                  <Button
                      onClick={() => handleQuantityChange(item, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </ButtonGroup>
                </Col>
                <Col xs={4} className="d-flex justify-content-end">
                  <Button
                    variant="danger"
                    onClick={() => handleRemoveItem(item)}
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
            fontSize: "large",
            fontWeight: "bolder",
            color: "#10caf0",
            paddingTop: "15px",
          }}
        >
          Subtotal: ${subTotal.toFixed(2)}
        </p>
        <p
          style={{
            fontSize: "medium",
            fontWeight: "bolder",
            color: "lightcyan",
            paddingTop: "15px",
          }}
        >
          Sales Tax: ${salesTax.toFixed(2)}
        </p>
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
        {cart.length > 0 && (
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              style={{ borderRadius: "10px", width: "100%" }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Form.Group>
        )}
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
              payCash(cart, history, "cash", notes);
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
