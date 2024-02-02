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
  process.env.SESSION_SECRET ||
  "1858f945b571cb256e4728a0779efc99bacd7b70da86f9c3b992a1661206057aa601b156690377c7d5f8d6300e9278d944120bc9f583f9899246636177e1f38e";
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
      io.emit("newOrder", newOrder);
    }

    res.json({ received: true });
  }
);

app.post("/api/processSquarePayment", async (req, res) => {
  const { idempotencyKey, nonce, amountMoney, notes } = req.body;

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
          notes: notes,
        };

        orders.push(newOrder);
        io.emit("newOrder", newOrder);
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
