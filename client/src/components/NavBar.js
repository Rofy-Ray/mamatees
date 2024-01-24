import { Container, Navbar, Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

function NavBar({ setShowCart, isLoggedOn, handleLogout }) {
  const location = useLocation();
  const currentRoute = location.pathname;

  return (
    <Navbar bg="dark" data-bs-theme="dark" variant="dark" sticky="top">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="me-auto">
          Mama T's Rollin' Snack Shack
        </Navbar.Brand>
        <Nav className="ms-auto">
          {currentRoute !== "/logon" &&
            currentRoute !== "/orders" &&
            currentRoute !== "/squarepayment" && (
              <>
                <Nav.Link as={Link} to="/">
                  Food
                </Nav.Link>
                <Nav.Link onClick={() => setShowCart(true)}>My Plate</Nav.Link>
              </>
            )}
          {isLoggedOn && location.pathname === "/orders" && (
            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default NavBar;
