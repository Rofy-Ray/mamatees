import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Button,
  Table,
  Container,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import { Redirect } from "react-router-dom";
import useSocket from "../hooks/useSocket";
import { IoAlertCircle } from "react-icons/io5";

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [isLoggedOn, setIsLoggedOn] = useState(
    localStorage.getItem("isLoggedOn") === "true"
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/api/orders`
        );
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    fetchOrders();

    setIsLoggedOn(localStorage.getItem("isLoggedOn") === "true");
  }, []);

  useSocket(setOrders, () => {});

  if (!isLoggedOn) {
    return <Redirect to="/logon" />;
  }

  const completeOrder = async (orderId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_SERVER_URL}/api/orders/${orderId}`
      );
      const newOrders = orders.filter((order) => order.id !== orderId);
      setOrders(newOrders);
      localStorage.setItem("MAMA_TEES_ORDERS", JSON.stringify(newOrders));
    } catch (error) {
      console.error("Failed to complete order:", error);
    }
  };

  return (
    <div className="order-list">
      {orders.length === 0 && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "80vh" }}
        >
          <Alert
            variant="info"
            style={{
              width: "25rem",
              textAlign: "center",
              fontSize: "x-large",
              fontWeight: "bold",
            }}
          >
            No New Plates To Make.
          </Alert>
        </div>
      )}
      <Container fluid>
        <Row className="g-4 justify-content-center pb-5">
          {orders &&
            orders.map((order, index) => (
              <Col key={order.id}>
                <Card
                  className="mb-3 mt-3 mx-2 order-card"
                  style={{ borderRadius: "15px", width: "25rem" }}
                >
                  <Card.Body className="order-body">
                    <Card.Title
                      style={{ fontWeight: "bolder", fontSize: "xx-large" }}
                    >
                      Order #{index + 1}
                    </Card.Title>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Food Item</th>
                          <th>Quantity</th>
                          {order.products.some((product) => product.isMeal) && (
                            <th>Type</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {order.products &&
                          order.products.map((product) => (
                            <tr key={product.uid}>
                              <td>
                                {order.payment === "cash" || product.name
                                  ? product.name
                                  : product.description}
                              </td>
                              <td>{product.quantity}</td>
                              {product.isMeal && <td>Meal</td>}
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                    {order.notes && <Alert variant="info">{order.notes}</Alert>}
                    {order.payment === "cash" && (
                      <Alert
                        variant="danger"
                        style={{
                          marginTop: "10px",
                          fontSize: "large",
                          fontWeight: "bold",
                          padding: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IoAlertCircle size={30} />
                        Take Cash Payment!
                      </Alert>
                    )}
                    <Button
                      variant="primary"
                      style={{
                        backgroundColor: "green",
                        borderRadius: "50px",
                        borderColor: "black",
                        fontSize: "large",
                        fontWeight: "bolder",
                      }}
                      onClick={() => completeOrder(order.id)}
                    >
                      PLATE MADE
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
        </Row>
      </Container>
    </div>
  );
}

export default Dashboard;
