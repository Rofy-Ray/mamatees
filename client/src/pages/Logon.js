import React, { useState } from "react";
import axios from "axios";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useLocation, useHistory } from "react-router-dom";

const Logon = ({ setIsLoggedOn }) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const history = useHistory();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/logon`,
        { passcode },
        { withCredentials: true }
      );
      if (response.status === 200) {
        const statusResponse = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/api/checkLogonStatus`,
          { withCredentials: true }
        );
        if (statusResponse.data.isLoggedOn) {
          setIsLoggedOn(true);
          localStorage.setItem("isLoggedOn", "true");
          const redirectPath = location.state?.from || "/"; 
          history.push(redirectPath);
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError("Invalid passcode. Please try again.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <Card className="p-4" style={{ borderRadius: "15px" }}>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Enter Your Passcode:</Form.Label>
            <Form.Control
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
            />
          </Form.Group>
          {error && <Alert variant="danger">{error}</Alert>}
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Check Orders"}
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Logon;
