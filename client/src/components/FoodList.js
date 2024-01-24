import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import FoodItem from "./FoodItem";

function FoodList({ filteredItems, addToCart }) {
  return (
    <div className="food-list">
      <Container fluid>
        <Row className="g-4 justify-content-center">
          {filteredItems &&
            filteredItems.map((item) => (
              <Col key={item._id}>
                <FoodItem item={item} addToCart={addToCart} />
              </Col>
            ))}
        </Row>
      </Container>
    </div>
  );
}

export default FoodList;
