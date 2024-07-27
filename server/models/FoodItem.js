const mongoose = require("mongoose");

const FoodItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  unit_price: Number,
  meal_price: Number,
  image: String,
  type: String,
  checked: { type: Boolean, default: false },
});

module.exports = mongoose.model("FoodItem", FoodItemSchema, "menu");
