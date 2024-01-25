const dbUtils = require("./dbUtils");

// Define your food items
const foodItems = [
  {
    name: "Mama T's Fried Bologna Sammich",
    description:
      "Fried bologna with tomato, grilled onions, cheese and mayo on toasted bread.",
    unit_price: 7.0,
    meal_price: 9.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/darfzhrzy3wsrb8bpjkf",
    type: "entree",
  },
  {
    name: "Mama T's Southern Bologna Sammich",
    description: "Fried bologna with slaw and pickled onions on toasted bread.",
    unit_price: 7.0,
    meal_price: 9.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/pkbbn0cyk7vquiobx6lt",
    type: "entree",
  },
  {
    name: "Mother Clucker Wrap",
    description:
      "Crispy fried chicken bites with lettuce, tomato, mayo, Mama T's sauce served in a wrap.",
    unit_price: 10.0,
    meal_price: 12.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/c58vim0dzqgfyzd46jtf",
    type: "entree",
  },
  {
    name: "Rusty Cockadoo Wrap",
    description:
      "Crispy fried chicken bites with slaw, pickled onions, mustard sauce served in a wrap.",
    unit_price: 10.0,
    meal_price: 12.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/a2rd8tldk1htscdxjrb6",
    type: "entree",
  },
  {
    name: "Crispy Fried Chicken Bites",
    description:
      "Crispy fried chicken bites with sauces - Mama T's, Honey Mustard and Ranch.",
    unit_price: 6.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/bxwjgcpdrmy5i6bjtlsj",
    type: "appetizer",
  },
  {
    name: "Grilled Cheese",
    description: "Classic grilled cheese sandwich.",
    unit_price: 3.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/qeck3pnchqoce32kstpn",
    type: "appetizer",
  },
  {
    name: "Tomato Sammich",
    description: "Fresh tomato sandwich.",
    unit_price: 3.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/emgxds6vncc1lcagopda",
    type: "appetizer",
  },
  {
    name: "Mama T's Chocolate Sinsation",
    description:
      "Cream cheese, chocolate chips, oreo cookies, Cool Whip and chocolate pudding whipped into a chocolate delight.",
    unit_price: 4.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/vdnjxwo3wqjbcfin9v13",
    type: "dessert",
  },
  {
    name: "Mama T's Banana Cream Dream",
    description:
      "Cream cheese, golden oreo cookies, Cool Whip and banana pudding spun into perfection.",
    unit_price: 4.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/unck7avecqlprztdmcct",
    type: "dessert",
  },
  {
    name: "Deep Fried Hotdog Combo",
    description:
      "Cheese, chill, mustard, onions and slaw. Served with tots and a drink.",
    unit_price: 6.0,
    meal_price: 7.5,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/sdz3xljfel2zgusjsfdn",
    type: "entree",
  },
  {
    name: "Deep Fried Hotdog Combo with a Kick",
    description:
      "Cheese, chill, mustard, onions and sauerkraut. Served with tots and a drink.",
    unit_price: 6.0,
    meal_price: 7.5,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/qdn8hhazwkcmaxp6z1j5",
    type: "entree",
  },
  {
    name: "Plain Dog",
    description: "Plain hotdog.",
    unit_price: 3.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/xw8hbzcvzr79cwbbzwwu",
    type: "appetizer",
  },
  {
    name: "Blue Kickin Chicken Basket",
    description:
      "Tots, buffalo chicken, crumbled blue cheese, jalapeno peppers, buffalo sauce and blues cheese dressing.",
    unit_price: 6.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/ns2btmnfk1z9oqxj37ji",
    type: "appetizer",
  },
  {
    name: "Pig in a Poke Basket",
    description: "Tots, chili, cheese, sour cream, bacon and jalapeno peppers.",
    unit_price: 6.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/djuuoxxec14mn5tq5n0v",
    type: "appetizer",
  },
  {
    name: "Loaded Basket",
    description: "Chili cheese tots.",
    unit_price: 5.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/gsipuy8kyplyspavmzub",
    type: "appetizer",
  },
  {
    name: "Plain Basket",
    description: "Plain tots.",
    unit_price: 3.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/f9wwm8qwimryyygg3p8a",
    type: "appetizer",
  },
  {
    name: "Mama T's Hand Pulled Nachos",
    description:
      "Hand pulled pork on a bed of tortilla chips with bacon, barbeque sauce, jalapenos, queso cheese and sour cream.",
    unit_price: 11.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/wwavbwttfjbtjwr7vhn3",
    type: "appetizer",
  },
  {
    name: "Mama T's Cheese Nachos",
    description: "Tortilla chips, cheese sauce and jalapenos.",
    unit_price: 6.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/tsxupsfmuotn2ai1bijc",
    type: "appetizer",
  },
  {
    name: "Mama T Has Freed Willy Sammich",
    description:
      "Golden fried cod nuggets on a hoagie with tartar sauce, slaw, tots and drink.",
    unit_price: 7.0,
    meal_price: 10.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/vwyqjxogznuxdsmrwoul",
    type: "entree",
  },
  {
    name: "Mama T's Catch of the Day",
    description:
      "Deep fried catfish nuggets Po Boy style with slaw, homemade tartar sauce and baked beans.",
    unit_price: 8.0,
    meal_price: 11.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/grwrjlzuwnelx0cfrbmp",
    type: "entree",
  },
  {
    name: "Aunt Renie's Collard Green Sammich",
    description:
      "Seasoned collard greens between 2 fried johnny cakes with pickled onions and fatback on the side. (Vinegar available upon request)",
    unit_price: 8.0,
    meal_price: 10.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/rg6dqxqef4fwkqdaqkuj",
    type: "entree",
  },
  {
    name: "Drinks",
    description:
      "Quench your thirst with our assortment of canned Coke products. Perfectly chilled and ready to refresh!",
    unit_price: 1.0,
    image:
      "https://res.cloudinary.com/dwenrtqrv/image/upload/f_auto,q_auto/v1/mamatees/th5g8glpordgqlzmepck",
    type: "beverage",
  },
];

const loadFoodItems = async () => {
  await dbUtils.connectDB();

  for (const item of foodItems) {
    await dbUtils.upsertFoodItem(item);
  }

  console.log("All menu items has been added/updated!");

  dbUtils.mongoose.connection.close();
};

loadFoodItems();
