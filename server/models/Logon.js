const mongoose = require("mongoose");

const passcodeSchema = new mongoose.Schema({
  _id: String,
  passcode: String,
});

module.exports = mongoose.model("Passcode", passcodeSchema, "passcode");
