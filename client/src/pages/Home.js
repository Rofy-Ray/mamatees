import { useState } from "react";
import {
  Container,
  Form,
  FormControl,
  Button,
  ButtonGroup,
  Modal,
} from "react-bootstrap";
import FoodList from "../components/FoodList";
import Cart from "../components/Cart";
import useFetchFoodItems from "../hooks/useFetchFoodItems";
import useWindowWidth from "../hooks/useWindowWidth";

function Home({ cart, setCart, updateQuantity, showCart, setShowCart }) {
  const items = useFetchFoodItems();
  const windowWidth = useWindowWidth();
  const [selectedType, setSelectedType] = useState("all");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const addToCart = (item) => {
    const existingItem = cart.find((i) => i._id === item._id);
    if (existingItem) {
      updateQuantity(item._id, existingItem.quantity + 1);
    } else {
      setCart([
        ...cart,
        {
          ...item,
          quantity: 1,
          price: item.price || item.unit_price,
          isMeal: item.isMeal || false,
        },
      ]);
    }
    setShowCart(true);
  };

  const filterItems = (type, filter) => {
    setSelectedType(type);
    setSelectedFilter(filter);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredItems = Array.isArray(items)
    ? items.filter(
        (item) =>
          (selectedType === "all" || item.type === selectedType) &&
          (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  return (
    <Container fluid>
      <div className="filter-options row">
        <div className="col-lg-4 col-md-4 col-sm-12">
          <Form id="search-form" className="form-inline w-100">
            <FormControl
              type="text"
              placeholder="Fill your plate..."
              className="mr-sm-2 w-100"
              name="search-food"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Form>
        </div>
        <div className="col-lg-7 col-md-7 col-sm-12">
          <ButtonGroup
            className="btn-group w-100"
            role="group"
            aria-label="Menu Filter Buttons Group"
          >
            <Button
              variant={selectedFilter === "all" ? "info" : "outline-info"}
              onClick={() => filterItems("all", "all")}
            >
              All
            </Button>
            <Button
              variant={selectedFilter === "appetizer" ? "info" : "outline-info"}
              onClick={() => filterItems("appetizer", "appetizer")}
            >
              Appetizers
            </Button>
            <Button
              variant={selectedFilter === "entree" ? "info" : "outline-info"}
              onClick={() => filterItems("entree", "entree")}
            >
              Entrees
            </Button>
            <Button
              variant={selectedFilter === "dessert" ? "info" : "outline-info"}
              onClick={() => filterItems("dessert", "dessert")}
            >
              Desserts
            </Button>
            <Button
              variant={selectedFilter === "beverage" ? "info" : "outline-info"}
              onClick={() => filterItems("beverage", "beverage")}
            >
              Drinks
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <div className="content">
        <FoodList filteredItems={filteredItems} addToCart={addToCart} />
        {windowWidth <= 768 ? (
          <Modal show={showCart} onHide={() => setShowCart(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Mama T's Rollin' Snack Shack</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className={`cart ${windowWidth <= 768 ? "cart-modal" : ""}`}>
                <Cart
                  cart={cart}
                  updateQuantity={updateQuantity}
                  setShowCart={setShowCart}
                />
              </div>
            </Modal.Body>
          </Modal>
        ) : (
          showCart && (
            <Cart
              cart={cart}
              updateQuantity={updateQuantity}
              setShowCart={setShowCart}
            />
          )
        )}
      </div>
    </Container>
  );
}

export default Home;
