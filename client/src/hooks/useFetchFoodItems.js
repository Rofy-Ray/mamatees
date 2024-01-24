import { useState, useEffect } from "react";

function useFetchFoodItems() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchFoodItems = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/getFoodItems`
      );
      const data = await response.json();
      setItems(data);
    };

    fetchFoodItems();
  }, []);

  return items;
}

export default useFetchFoodItems;
