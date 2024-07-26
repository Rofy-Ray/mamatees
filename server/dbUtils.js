const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../client/.env") });
const mongoose = require("mongoose");
const FoodItem = require("./models/FoodItem");
const crypto = require("crypto");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Database connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

async function upsertFoodItem(item) {
  try {
    const hash = crypto.createHash("sha256");
    hash.update(item.description + item.price + item.image + item.type);
    const id = hash.digest("hex");

    const existingItem = await FoodItem.findOne({ _id: id });
    if (existingItem) {
      existingItem.name = item.name;
      existingItem.description = item.description;
      existingItem.unit_price = item.unit_price;
      existingItem.meal_price = item.meal_price;
      existingItem.image = item.image;
      existingItem.type = item.type;
      existingItem.checked = item.checked;
      return await existingItem.save();
    } else {
      const newItem = new FoodItem({
        _id: id,
        name: item.name,
        description: item.description,
        unit_price: item.unit_price,
        meal_price: item.meal_price,
        image: item.image,
        type: item.type,
        checked: item.checked,
      });
      return await newItem.save();
    }
  } catch (err) {
    console.error(err.message);
    throw err;
  }
}

module.exports = { connectDB, upsertFoodItem, mongoose };
