import { Card, Button } from "react-bootstrap";
import { XCircle } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

function CancelCard({ setShowCart }) {
  const handleGoHome = () => {
    setShowCart(true);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "calc(100vh - 120px)" }}
    >
      <Card className="text-center" style={{ borderRadius: "25px" }}>
        <Card.Body>
          <XCircle size={60} className="mb-4" />
          <Card.Title style={{ fontWeight: "bolder" }}>
            Payment Cancelled
          </Card.Title>
          <Card.Text>Your payment has been cancelled.</Card.Text>
          <Link to="/" onClick={handleGoHome}>
            <Button
              onClick={handleGoHome}
              style={{
                borderRadius: "25px",
                backgroundColor: "red",
                borderColor: "black",
              }}
            >
              One More Time
            </Button>
          </Link>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CancelCard;
