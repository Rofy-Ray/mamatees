import { useState, useEffect, useRef } from "react";
import "./App.css";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import {
  Route,
  Switch,
  useHistory,
  Redirect,
  useLocation,
} from "react-router-dom";
import SuccessCard from "./pages/SuccessCard";
import CancelCard from "./pages/CancelCard";
import Dashboard from "./pages/Dashboard";
import Logon from "./pages/Logon";
import SquarePaymentForm from "./pages/SquarePaymentForm";

function App() {
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("MAMA_TEES_CART")) || []
  );
  const [showCart, setShowCart] = useState(false);
  const [isLoggedOn, setIsLoggedOn] = useState(
    localStorage.getItem("isLoggedOn") === "true"
  );
  const [currentRoute, setCurrentRoute] = useState("/");
  const history = useHistory();
  const location = useLocation();
  const prevLocation = useRef();

  useEffect(() => {
    setCurrentRoute(isLoggedOn ? "/orders" : "/logon");
    localStorage.setItem("MAMA_TEES_CART", JSON.stringify(cart));
  }, [isLoggedOn, cart]);

  useEffect(() => {
    if (location.pathname === "/success") {
      setCart([]);
      localStorage.removeItem("MAMA_TEES_CART");
    }
  }, [location]);

  useEffect(() => {
    if (
      location.pathname === "/" &&
      prevLocation.current === "/squarepayment"
    ) {
      setShowCart(true);
    }
    prevLocation.current = location.pathname;
  }, [location]);

  const handleLogout = () => {
    setIsLoggedOn(false);
    localStorage.setItem("isLoggedOn", "false");
    history.push("/logon");
  };

  const updateQuantity = (itemId, quantity) => {
    setCart((prevCart) => {
      if (quantity > 0) {
        const updatedCart = prevCart.map((item) =>
          item._id === itemId ? { ...item, quantity: Number(quantity) } : item
        );
        localStorage.setItem("MAMA_TEES_CART", JSON.stringify(updatedCart));
        return updatedCart;
      } else {
        const updatedCart = prevCart.filter((item) => item._id !== itemId);
        localStorage.setItem("MAMA_TEES_CART", JSON.stringify(updatedCart));
        return updatedCart;
      }
    });
  };

  return (
    <div className="App">
      <NavBar
        setShowCart={setShowCart}
        isLoggedOn={isLoggedOn}
        handleLogout={handleLogout}
        currentRoute={currentRoute}
      />
      <Switch>
        <Route exact path="/">
          <Home
            cart={cart}
            setCart={setCart}
            updateQuantity={updateQuantity}
            showCart={showCart}
            setShowCart={setShowCart}
          />
        </Route>
        <Route path="/success">
          <SuccessCard />
        </Route>
        <Route path="/cancel">
          <CancelCard setShowCart={setShowCart} />
        </Route>
        <Route path="/orders">
          {isLoggedOn ? <Dashboard /> : <Redirect to="/logon" />}
        </Route>
        ) : (
        <Route path="/logon">
          {isLoggedOn ? (
            <Redirect to="/orders" />
          ) : (
            <Logon setIsLoggedOn={setIsLoggedOn} />
          )}
        </Route>
        <Route path="/squarepayment">
          <SquarePaymentForm />
        </Route>
      </Switch>
      <Footer />
    </div>
  );
}

export default App;
