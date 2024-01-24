const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const crypto = require("crypto");
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
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const port = process.env.PORT || 5001;

setInterval(
  () => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    orders = orders.filter((order) => order.timestamp > oneHourAgo);
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

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use("/api/stripewebhook", express.raw({ type: "application/json" }));
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(express.static("public"));
}

const secretKey = crypto.randomBytes(64).toString("hex");
const isSecure = process.env.NODE_ENV === "production";
app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongooseConnection: mongoose.connection }),
    cookie: { secure: isSecure, sameSite: 'none' },
  })
);

dbUtils.connectDB();

const squareClient = new Client({
  environment: Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
});

app.get("/api/getFoodItems", async (req, res) => {
  const foodItems = await FoodItem.find();
  res.json(foodItems);
});

app.post("/api/addFoodItems", async (req, res) => {
  const savedFoodItem = await dbUtils.upsertFoodItem(req.body);
  res.json(savedFoodItem);
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
      console.log(`Error constructing event: ${err.message}`);
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
      console.log(orders);
      io.emit("newOrder", newOrder);
    }

    res.json({ received: true });
  }
);

app.post("/api/processSquarePayment", async (req, res) => {
  const { idempotencyKey, nonce, amountMoney } = req.body;

  try {
    const {
      result: { payment },
    } = await squareClient.paymentsApi.createPayment({
      idempotencyKey,
      sourceId: nonce,
      amountMoney,
    });

    const replacer = (key, value) =>
      typeof value === "bigint" ? value.toString() : value;

    res.json(JSON.parse(JSON.stringify(payment, replacer)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post(
  "/api/squarewebhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const event = JSON.parse(req.body);

    if (event.type === "payment.updated") {
      const payment = event.data.object;

      if (payment.status === "COMPLETED") {
        const newOrder = {
          id: uuidv4(),
          products: payment.lineItems,
          timestamp: Date.now(),
        };

        orders.push(newOrder);
        console.log(orders);
        io.emit("newOrder", newOrder);
      }
    }

    res.json({ received: true });
  }
);

app.post("/api/payCash", async (req, res) => {
  const { products } = req.body;

  try {
    const orderId = uuidv4();
    const newOrder = {
      id: orderId,
      products: products.map((product) => ({ ...product, uid: uuidv4() })),
      timestamp: Date.now(),
      payment: "cash",
    };
    orders.push(newOrder);
    console.log(orders);
    io.emit("newOrder", newOrder);

    res.json({ id: orderId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/orders", (req, res) => {
  res.json(orders);
});

async function getHashedPasscodeFromDB() {
  const passcodeData = await Passcode.findOne({
    _id: "693e8274df128e22b0dc1dd0784cd5e3",
  });
  return passcodeData ? passcodeData.passcode : null;
}

app.post("/api/logon", async (req, res) => {
  const { passcode } = req.body;
  const hashedPasscode = await getHashedPasscodeFromDB();
  if (hashedPasscode && (await bcrypt.compare(passcode, hashedPasscode))) {
    req.session.isLoggedOn = true;
    console.log('Logon session:', req.session);
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

app.get("/api/checkLogonStatus", (req, res) => {
  console.log('Check logon status session:', req.session);
  res.json({ isLoggedOn: req.session.isLoggedOn || false });
});

app.get("/", (req, res) => {
  res.send("Server is running...");
});

// app.get("/*", function (req, res) {
//   res.sendFile(
//     path.join(__dirname, "../client/public/index.html"),
//     function (err) {
//       if (err) {
//         res.status(500).send(err);
//       }
//     }
//   );
// });

server.listen(port, () => console.log(`Server started on port ${port}...`));
