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
import FixMenu from "./pages/FixMenu";
import AddMenu from "./pages/AddMenu";

function App() {
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("MAMA_TEES_CART")) || []
  );
  const [showCart, setShowCart] = useState(false);
  const [notes, setNotes] = useState(
    localStorage.getItem("MAMA_TEES_NOTES") || ""
  );
  const [isLoggedOn, setIsLoggedOn] = useState(
    localStorage.getItem("isLoggedOn") === "true"
  );
  const [currentRoute, setCurrentRoute] = useState("/");
  const history = useHistory();
  const location = useLocation();
  const prevLocation = useRef();
  const targetRoute = location.state?.from || "/";

  useEffect(() => {
    setCurrentRoute(isLoggedOn ? "/orders" : "/logon");
    localStorage.setItem("MAMA_TEES_CART", JSON.stringify(cart));
  }, [isLoggedOn, cart]);

  useEffect(() => {
    localStorage.setItem("MAMA_TEES_NOTES", notes);
  }, [notes]);

  useEffect(() => {
    if (location.pathname === "/success") {
      setCart([]);
      setNotes("");
      localStorage.removeItem("MAMA_TEES_CART");
      localStorage.removeItem("MAMA_TEES_NOTES");
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
    fetch(`${process.env.REACT_APP_SERVER_URL}/api/logout`, {
      method: "POST",
    })
      .then((res) => {
        if (res.ok) {
          setIsLoggedOn(false);
          localStorage.setItem("isLoggedOn", "false");
          history.push("/logon");
        } else {
          console.error("Logout failed");
        }
      })
      .catch((err) => console.error(err));
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

  const removeItem = (id, isMeal) => {
    setCart((prevCart) => prevCart.filter((item) => !(item._id === id && item.isMeal === isMeal)));
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
            removeItem={removeItem}
            notes={notes}
            setNotes={setNotes}
          />
        </Route>
        <Route path="/success">
          <SuccessCard />
        </Route>
        <Route path="/cancel">
          <CancelCard setShowCart={setShowCart} />
        </Route>
        <Route path="/orders">
          {isLoggedOn ? <Dashboard /> : <Redirect to={{ pathname: "/logon", state: { from: "/orders" } }} />}
        </Route>
        <Route path="/fix">
          {isLoggedOn ? <FixMenu /> : <Redirect to={{ pathname: "/logon", state: { from: "/fix" } }} />}
        </Route>
        <Route path="/add">
          {isLoggedOn ? <AddMenu /> : <Redirect to={{ pathname: "/logon", state: { from: "/add" } }} />}
        </Route>
        <Route path="/edit">
          {isLoggedOn ? <AddMenu /> : <Redirect to={{ pathname: "/logon", state: { from: "/edit" } }} />}
        </Route>
        <Route path="/logon">
          {isLoggedOn ? <Redirect to={targetRoute} /> : <Logon setIsLoggedOn={setIsLoggedOn} />}
        </Route>
        <Route path="/squarepayment">
          <SquarePaymentForm />
        </Route>
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
      <Footer />
    </div>
  );
}

export default App;
