const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../client/.env") });
const mongoose = require("mongoose");
const FoodItem = require("./models/FoodItem");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Database connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

async function deleteFoodItem(id) {
  try {
    await FoodItem.deleteOne({ _id: id });
  } catch (err) {
    console.error(err.message);
    throw err;
  }
}

async function getFoodItemById(id) {
  try {
    return await FoodItem.findById(id);
  } catch (err) {
    console.error(err.message);
    throw err;
  }
}

async function upsertFoodItem(item) {
  try {
    let existingItem;

    if (item._id) {
      existingItem = await FoodItem.findById(item._id);
    }

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

module.exports = { connectDB, upsertFoodItem, deleteFoodItem, getFoodItemById, mongoose };
