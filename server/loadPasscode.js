const bcrypt = require("bcrypt");
const dbUtils = require("./dbUtils");
const Passcode = require("./models/Logon");

const saltRounds = 10;
const passcode = "alenacarson";

dbUtils.connectDB().then(async () => {
  const hash = await bcrypt.hash(passcode, saltRounds);
  const staticId = "693e8274df128e22b0dc1dd0784cd5e3";

  try {
    const doc = await Passcode.findOneAndUpdate(
      { _id: staticId },
      { passcode: hash },
      { upsert: true, new: true }
    );
    console.log("Passcode saved successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    dbUtils.mongoose.connection.close();
  }
});
