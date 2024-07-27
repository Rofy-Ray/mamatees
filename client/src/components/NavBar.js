import { Container, Navbar, Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

function NavBar({ setShowCart, isLoggedOn, handleLogout }) {
  const location = useLocation();
  const currentRoute = location.pathname;

  return (
    <Navbar bg="dark" data-bs-theme="dark" variant="dark" sticky="top" expand="lg">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="me-auto">
          Mama T's Rollin' Snack Shack
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {currentRoute === "/" && (
                <>
                  <Nav.Link as={Link} to="/">
                    Food
                  </Nav.Link>
                  <Nav.Link onClick={() => setShowCart(true)}>My Plate</Nav.Link>
                </>
              )}
              {isLoggedOn && (
                <>
                  {(currentRoute === "/orders" || currentRoute === "/fix" || currentRoute === "/add" || currentRoute === "/edit") && (
                    <>
                      <Nav.Link as={Link} to="/orders">
                        Orders
                      </Nav.Link>
                      <Nav.Link as={Link} to="/fix">
                        Fix Menu
                      </Nav.Link>
                      <Nav.Link as={Link} to="/add">
                        Add Menu
                      </Nav.Link>
                      <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                    </>
                  )}
                </>
              )}
            </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
