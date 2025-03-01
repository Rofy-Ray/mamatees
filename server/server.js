const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const dbUtils = require("./dbUtils");
const FoodItem = require("./models/FoodItem");
const Passcode = require("./models/Logon");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Client, Environment } = require("square");
const { v4: uuidv4 } = require("uuid");
const app = express();
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});
const port = process.env.PORT || 5001;

setInterval(
  () => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    orders = orders.filter((order) => order.timestamp > oneHourAgo);
    checkouts = checkouts.filter((checkout) => checkout.timestamp > oneHourAgo);
  },
  60 * 60 * 1000
);

let orders = [];

io.on("connection", (socket) => {
  console.log("New client connected...");
  socket.on("disconnect", () => {
    console.log("Client disconnected.");
  });
});

const secretKey =
  process.env.NODE_ENV === "production"
    ? process.env.SESSION_SECRET
    : process.env.DEV_SESSION_SECRET;
const isSecure = process.env.NODE_ENV === "production";
const sameSite = isSecure ? "none" : "lax";
app.use(
  session({
    secret: secretKey,
    name: "mamatees",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 1 * 24 * 60 * 60,
      autoRemove: "native",
      touchAfter: 24 * 3600,
    }),
    cookie: {
      secure: isSecure,
      sameSite: sameSite,
      httpOnly: true,
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use("/api/stripewebhook", express.raw({ type: "application/json" }));
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(express.static("public"));
}

dbUtils.connectDB();

const squareClient = new Client({
  environment:
    process.env.NODE_ENV === "production"
      ? Environment.Production
      : Environment.Sandbox,
  accessToken:
    process.env.NODE_ENV === "production"
      ? process.env.SQUARE_ACCESS_TOKEN
      : process.env.SQUARE_SANDBOX_ACCESS_TOKEN,
});

app.get("/api/getFoodItems", async (req, res) => {
  const foodItems = await FoodItem.find();
  res.json(foodItems);
});

app.get("/api/getCheckedFoodItems", async (req, res) => {
  try {
    const checkedItems = await FoodItem.find({ checked: true });
    res.json(checkedItems);
  } catch (error) {
    console.error("Error fetching checked food items:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/upsertFoodItems", async (req, res) => {
  const savedFoodItem = await dbUtils.upsertFoodItem(req.body);
  res.json(savedFoodItem);
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mamatees",
    format: async (req, file) => "png", 
    public_id: (req, file) => file.originalname,
  },
});

const parser = multer({ storage: storage });

app.post("/api/uploadImage", parser.single("file"), (req, res) => {
  res.json({ secure_url: req.file.path });
});

app.post("/api/updateMenuItems", async (req, res) => {
  const { items } = req.body;
  try {
      const bulkOps = items.map(item => ({
          updateOne: {
              filter: { _id: item._id },
              update: { $set: { checked: item.checked } }
          }
      }));

      await FoodItem.bulkWrite(bulkOps);
      res.sendStatus(200);
  } catch (error) {
      console.error("Error updating menu items:", error);
      res.status(500).json({ error: error.message });
  }
});

app.delete("/api/deleteFoodItem/:id", async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);
    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    const imageUrl = foodItem.image;
    const publicId = imageUrl
      .split('/').slice(-2) 
      .join('/')               
      .split('.').slice(0, -1)
      .join('.'); 
    await dbUtils.deleteFoodItem(req.params.id);
    result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image'
    });
    if (result.result === 'ok') {
      res.sendStatus(200);
    } else {
      throw new Error('Failed to delete image from Cloudinary');
    }
  } catch (error) {
    console.error("Error deleting food item:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/getFoodItem/:id", async (req, res) => {
  try {
    const foodItem = await dbUtils.getFoodItemById(req.params.id);
    res.json(foodItem);
  } catch (error) {
    console.error("Error fetching food item:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/processStripePayment", async (req, res) => {
  const { products } = req.body;

  const lineItems = products.map((product) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: product.name,
        images: [product.image],
      },
      unit_amount: product.price * 100,
    },
    quantity: product.quantity,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.json({ id: session.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post(
  "/api/stripewebhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`Error constructing event: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      );
      const orderId = uuidv4();
      const newOrder = {
        id: orderId,
        products: lineItems.data.map((product) => ({
          ...product,
          uid: uuidv4(),
        })),
        timestamp: Date.now(),
      };
      orders.push(newOrder);
      io.emit("newOrder", newOrder);
    }

    res.json({ received: true });
  }
);

let checkouts = [];

app.post("/api/processSquarePayment", async (req, res) => {
  const { idempotencyKey, nonce, amountMoney, note, products } = req.body;

  try {
    const response = await squareClient.paymentsApi.createPayment({
      idempotencyKey,
      sourceId: nonce,
      amountMoney,
      note
    });

    const replacer = (key, value) =>
      typeof value === "bigint" ? value.toString() : value;

    // console.log("Payment Response: ", response.result.payment);
    // checkouts.push({ ...response.result.payment, products: products, timestamp: Date.now() });
    // console.log("Checkouts List After Push: ", checkouts);

    res.json(JSON.parse(JSON.stringify(response, replacer)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/createCheckout", async (req, res) => {
  const { total, notes, products } = req.body;
  try {
    const roundedTotal = Math.round(total * 100);
    const response = await squareClient.terminalApi.createTerminalCheckout({
      idempotencyKey: uuidv4(),
      checkout: {
        amountMoney: {
          amount: roundedTotal,
          currency: "USD",
        },
        note: notes,
        deviceOptions: {
          deviceId:
            process.env.NODE_ENV === "production"
              ? process.env.SQUARE_DEVICE_ID
              : process.env.SQUARE_SANDBOX_DEVICE_ID,
          skipReceiptScreen: false,
          tipSettings: {
            allowTipping: true,
            separateTipScreen: true,
            customTipField: true,
          },
        },
        pricingOptions: {
          autoApplyTaxes: true,
        }
      },
    });

    const replacer = (key, value) =>
      typeof value === "bigint" ? value.toString() : value;

    console.log("Checkout Response: ", response.result.checkout);
    checkouts.push({ ...response.result.checkout, products: products, timestamp: Date.now() });
    console.log("Checkouts List After Push: ", checkouts);

    res.json(JSON.parse(JSON.stringify(response, replacer)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post(
  "/api/squarewebhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const event = req.body;

    if (
      // event.type === "payment.updated" ||
      event.type === "terminal.checkout.updated"
    ) {
      try {
        const object = event.data.object;

        let status, id;
        status = object.checkout.status;
        id = object.checkout.id;
        // let status, id, processingFee;
        // if (event.type === "payment.updated") {
        //   status = object.payment.status;
        //   id = object.payment.id;
        //   processingFee = object.payment.processing_fee;
        // } else if (event.type === "terminal.checkout.updated") {
        //   status = object.checkout.status;
        //   id = object.checkout.id;
        // }

        if ((
          // processingFee || 
          event.type === "terminal.checkout.updated") 
          && status === "COMPLETED") {
          const checkout = checkouts.find((c) => c.id === id);

          if (!checkout) {
            console.error(`No checkout found with id: ${id}`);
            console.log("Current Checkouts List: ", checkouts);
            return;
          }

          const orderId = uuidv4();
          const newOrder = {
            id: orderId,
            products: checkout.products.map((product) => ({
              ...product,
              uid: uuidv4(),
            })),
            timestamp: Date.now(),
            notes: checkout.note,
          };

          orders.push(newOrder);
          io.emit("newOrder", newOrder);

          io.emit("squarePaymentCompleted", { checkoutId: id });
        }
      } catch (error) {
        console.error("Error processing event: ", error);
      }
    }

    res.json({ received: true });
  }
);

app.post("/api/payCash", async (req, res) => {
  const { products, notes } = req.body;

  try {
    const orderId = uuidv4();
    const newOrder = {
      id: orderId,
      products: products.map((product) => ({ ...product, uid: uuidv4() })),
      timestamp: Date.now(),
      payment: "cash",
      notes: notes,
    };
    orders.push(newOrder);
    io.emit("newOrder", newOrder);

    res.json({ id: orderId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/orders", (req, res) => {
  res.json(orders);
});

app.delete("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  orders = orders.filter((order) => order.id !== id);
  res.status(204).end();
});

async function getHashedPasscodeFromDB() {
  try {
    const passcodeData = await Passcode.findOne({
      _id: "693e8274df128e22b0dc1dd0784cd5e3",
    });
    return passcodeData ? passcodeData.passcode : null;
  } catch (err) {
    console.error("Error fetching passcode:", err);
    return null;
  }
}

app.post("/api/logon", async (req, res) => {
  const { passcode } = req.body;
  const hashedPasscode = await getHashedPasscodeFromDB();

  if (!hashedPasscode) {
    return res
      .status(500)
      .send("An error occurred while fetching the passcode.");
  }

  try {
    const isMatch = await bcrypt.compare(passcode, hashedPasscode);
    if (isMatch) {
      req.session.isLoggedOn = true;
      req.session.save((err) => {
        if (err) {
          res.status(500).send("An error occurred while saving the session.");
        } else {
          res.sendStatus(200);
        }
      });
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    res.status(500).send("An error occurred while comparing passcodes.");
  }
});

app.get("/api/checkLogonStatus", (req, res) => {
  res.json({ isLoggedOn: req.session.isLoggedOn || false });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send("An error occurred while destroying the session.");
    } else {
      res.sendStatus(200);
    }
  });
});

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.post("/api/createDeviceCode", async (req, res) => {
  try {
    const response = await squareClient.devicesApi.createDeviceCode({
      idempotencyKey: uuidv4(),
      deviceCode: {
        name: "Mama T's Food Truck Terminal",
        productType: "TERMINAL_API",
        locationId:
          process.env.NODE_ENV === "production"
            ? process.env.REACT_APP_SQUARE_LOCATION_ID
            : process.env.REACT_APP_SQUARE_SANDBOX_LOCATION_ID,
      },
    });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/getDeviceCode", async (req, res) => {
  try {
    const deviceId = req.query.deviceId;
    const response = await squareClient.devicesApi.getDeviceCode(deviceId);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

server.listen(port, () => console.log(`Server started on port ${port}...`));
