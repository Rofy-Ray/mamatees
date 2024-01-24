const mongoose = require("mongoose");

const FoodItemSchema = new mongoose.Schema({
  _id: String,
  name: String,
  description: String,
  unit_price: Number,
  meal_price: Number,
  image: String,
  type: String,
});

module.exports = mongoose.model("FoodItem", FoodItemSchema, "menu");
