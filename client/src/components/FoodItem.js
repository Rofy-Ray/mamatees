import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";

function FoodItem({ item, addToCart }) {
  const [isMeal, setIsMeal] = useState(false);

  const handleMeal = () => {
    setIsMeal(!isMeal);
  };

  const handleAddToCart = () => {
    addToCart({
      ...item,
      price: isMeal ? item.meal_price : item.unit_price,
      isMeal,
    });
  };

  return (
    <Card
      bg="dark"
      text="white"
      border="light"
      style={{ width: "18rem" }}
      className="food-card"
    >
      <div className="food-image">
        <Card.Img variant="top" src={item.image} />
      </div>
      <Card.Body className="food-body">
        <Card.Title className="food-name">{item.name}</Card.Title>
        <Card.Text>{item.description}</Card.Text>
        {item.meal_price && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              margin: "10px 0",
            }}
          >
            <Button variant="secondary" onClick={handleMeal}>
              {isMeal
                ? item.type === "beverage"
                  ? "Main Cup"
                  : "Sandwich Only"
                : item.type === "beverage"
                ? "Refill"
                : "Make Meal"
              }
            </Button>
          </div>
        )}
        <div className="food-footer">
          <div className="price-container">
            <Card.Text className="food-price">
              $
              {isMeal ? item.meal_price.toFixed(2) : item.unit_price.toFixed(2)}
            </Card.Text>
          </div>
          <Button variant="light" onClick={handleAddToCart}>
            Add to My Plate
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default FoodItem;
