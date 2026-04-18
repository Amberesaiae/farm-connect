export type Product = {
  id: string;
  name: string;
  price: number;
  unit?: string;
  image: string;
  category: string;
  brand?: string;
  description?: string;
  rating?: number;
};

export type Category = {
  id: string;
  name: string;
  image: string;
};

const u = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const PRODUCTS: Product[] = [
  {
    id: "cabbage",
    name: "Fresh Cabbage",
    price: 2.5,
    unit: "/ kg",
    image: u("photo-1594282486552-05b4d80fbb9f"),
    category: "Vegetables",
    brand: "Green Acres",
    rating: 4.7,
    description:
      "Hand-picked, crisp green cabbage grown on local farms. Rich in vitamins K and C, perfect for salads, slaws and stir-fries.",
  },
  {
    id: "paprika",
    name: "Red Paprika",
    price: 3.2,
    unit: "/ kg",
    image: u("photo-1563565375-f3fdfdbefa83"),
    category: "Vegetables",
    brand: "Sunny Fields",
    rating: 4.8,
    description:
      "Sweet, sun-ripened red paprika with a deep flavor. Great for roasting, stuffing or fresh salads.",
  },
  {
    id: "peas",
    name: "Green Peas",
    price: 1.8,
    unit: "/ kg",
    image: u("photo-1587735243615-c03f25aaff15"),
    category: "Vegetables",
    brand: "Farm Fresh",
    rating: 4.6,
    description:
      "Tender garden peas, freshly shelled. Naturally sweet and packed with protein.",
  },
  {
    id: "ladyfinger",
    name: "Lady Finger",
    price: 2.0,
    unit: "/ kg",
    image: u("photo-1664854122860-da59f47cb1bf"),
    category: "Vegetables",
    brand: "Green Acres",
    rating: 4.5,
    description:
      "Tender okra pods, perfect for curries, stir-fries and grilling.",
  },
  {
    id: "cauliflower",
    name: "Cauliflower",
    price: 2.3,
    unit: "/ kg",
    image: u("photo-1568584711271-6c929fb49b60"),
    category: "Vegetables",
    brand: "Farm Fresh",
    rating: 4.4,
    description:
      "Snow-white, tightly packed florets. Perfect roasted, riced or made into soups.",
  },
  {
    id: "spinach",
    name: "Fresh Spinach",
    price: 1.5,
    unit: "/ bunch",
    image: u("photo-1576045057995-568f588f82fb"),
    category: "Vegetables",
    brand: "Leaf Co.",
    rating: 4.7,
    description:
      "Tender, dark green spinach leaves harvested at peak freshness.",
  },
  {
    id: "broccoli",
    name: "Broccoli",
    price: 2.7,
    unit: "/ kg",
    image: u("photo-1459411552884-841db9b3cc2a"),
    category: "Vegetables",
    brand: "Green Acres",
    rating: 4.6,
    description:
      "Crisp broccoli crowns full of vitamins. Steam, roast or stir-fry to perfection.",
  },
  {
    id: "apple",
    name: "Red Apples",
    price: 3.5,
    unit: "/ kg",
    image: u("photo-1568702846914-96b305d2aaeb"),
    category: "Fruits",
    brand: "Orchard Hill",
    rating: 4.9,
    description:
      "Sweet and crunchy red apples, hand-picked from heritage orchards.",
  },
  {
    id: "cherry",
    name: "Cherries",
    price: 6.0,
    unit: "/ kg",
    image: u("photo-1528821128474-27f963b062bf"),
    category: "Fruits",
    brand: "Orchard Hill",
    rating: 4.8,
    description:
      "Plump, juicy cherries with a deep red color and balanced sweetness.",
  },
  {
    id: "lime",
    name: "Fresh Lime",
    price: 2.2,
    unit: "/ kg",
    image: u("photo-1622957461168-202e611f2190"),
    category: "Fruits",
    brand: "Citrus Grove",
    rating: 4.5,
    description:
      "Aromatic limes bursting with juice — essential for cocktails, marinades and dressings.",
  },
  {
    id: "avocado",
    name: "Avocado",
    price: 4.5,
    unit: "/ kg",
    image: u("photo-1523049673857-eb18f1d7b578"),
    category: "Fruits",
    brand: "Green Heart",
    rating: 4.7,
    description:
      "Creamy, ripe avocados ready for guacamole, toast and salads.",
  },
  {
    id: "wheat",
    name: "Whole Wheat",
    price: 1.2,
    unit: "/ kg",
    image: u("photo-1574323347407-f5e1ad6d020b"),
    category: "Grains & Pulses",
    brand: "Mill Co.",
    rating: 4.6,
    description:
      "Stone-milled whole wheat for hearty bread and rotis.",
  },
  {
    id: "rice",
    name: "Basmati Rice",
    price: 2.8,
    unit: "/ kg",
    image: u("photo-1586201375761-83865001e31c"),
    category: "Grains & Pulses",
    brand: "Royal Harvest",
    rating: 4.8,
    description: "Long-grain aromatic basmati, aged for the perfect texture.",
  },
  {
    id: "corn",
    name: "Sweet Corn",
    price: 1.6,
    unit: "/ ear",
    image: u("photo-1601593768799-76d3f6e8c1ec"),
    category: "Grains & Pulses",
    brand: "Farm Fresh",
    rating: 4.5,
    description: "Sun-ripened sweet corn — boil, grill or roast.",
  },
  {
    id: "quinoa",
    name: "Organic Quinoa",
    price: 5.4,
    unit: "/ kg",
    image: u("photo-1586201375761-83865001e31c", 800),
    category: "Grains & Pulses",
    brand: "Pure Earth",
    rating: 4.7,
    description: "Protein-rich, organic quinoa — a complete plant protein.",
  },
  {
    id: "cardamom",
    name: "Green Cardamom",
    price: 12.0,
    unit: "/ 100g",
    image: u("photo-1532336414038-cf19250c5757"),
    category: "Spices",
    brand: "Spice Route",
    rating: 4.9,
    description: "Aromatic green cardamom pods — sweet, floral and warming.",
  },
  {
    id: "garlic",
    name: "Fresh Garlic",
    price: 3.0,
    unit: "/ kg",
    image: u("photo-1471197132245-7ad9bbd3a47e"),
    category: "Vegetables",
    brand: "Farm Fresh",
    rating: 4.6,
    description: "Pungent, fresh garlic bulbs — kitchen essential.",
  },
  {
    id: "onion",
    name: "Red Onion",
    price: 1.4,
    unit: "/ kg",
    image: u("photo-1518977676601-b53f82aba655"),
    category: "Vegetables",
    brand: "Green Acres",
    rating: 4.5,
    description: "Sweet red onions with a mild, crisp flavor.",
  },
  {
    id: "pumpkin",
    name: "Pumpkin",
    price: 2.1,
    unit: "/ kg",
    image: u("photo-1570586437263-ab629fccc818"),
    category: "Vegetables",
    brand: "Harvest Moon",
    rating: 4.4,
    description: "Bright orange pumpkin — perfect for soups and pies.",
  },
  {
    id: "milk",
    name: "Farm Milk 1L",
    price: 1.9,
    unit: "/ 1L",
    image: u("photo-1550583724-b2692b85b150"),
    category: "Dairy",
    brand: "Daily Dairy",
    rating: 4.7,
    description: "Fresh whole milk delivered the morning it's bottled.",
  },
  {
    id: "ghee",
    name: "Pure Ghee",
    price: 8.5,
    unit: "/ 500g",
    image: u("photo-1631452180519-c014fe946bc7"),
    category: "Oil & Ghee",
    brand: "Pure Earth",
    rating: 4.8,
    description: "Slow-cooked ghee with a rich, nutty aroma.",
  },
  {
    id: "coffee",
    name: "Arabica Coffee",
    price: 9.5,
    unit: "/ 250g",
    image: u("photo-1559056199-641a0ac8b55e"),
    category: "Coffee & Tea",
    brand: "Highland Roast",
    rating: 4.9,
    description: "Single-origin arabica beans, freshly roasted.",
  },
];

export const CATEGORIES: Category[] = [
  { id: "vegetables", name: "Vegetables", image: u("photo-1540420773420-3366772f4999") },
  { id: "fruits", name: "Fruits", image: u("photo-1610832958506-aa56368176cf") },
  { id: "grains", name: "Grains & Pulses", image: u("photo-1586201375761-83865001e31c") },
  { id: "machinery", name: "Machinery", image: u("photo-1500382017468-9049fed747ef") },
  { id: "spices", name: "Spices", image: u("photo-1532336414038-cf19250c5757") },
  { id: "oil", name: "Oil & Ghee", image: u("photo-1631452180519-c014fe946bc7") },
  { id: "dairy", name: "Dairy", image: u("photo-1550583724-b2692b85b150") },
  { id: "coffee", name: "Coffee & Tea", image: u("photo-1559056199-641a0ac8b55e") },
];

export const MARKET_MOVES = [
  { id: "wheat", change: +2.4 },
  { id: "rice", change: -0.8 },
  { id: "corn", change: +1.2 },
  { id: "coffee", change: +3.7 },
  { id: "cardamom", change: -1.4 },
  { id: "ghee", change: +0.6 },
];

export type CartLine = { id: string; qty: number };

export const INITIAL_CART: CartLine[] = [
  { id: "cabbage", qty: 2 },
  { id: "apple", qty: 1 },
  { id: "milk", qty: 3 },
];

export type Order = {
  id: string;
  date: string;
  total: number;
  status: "Pending" | "Completed" | "Cancelled";
  items: { id: string; qty: number }[];
};

export const ORDERS: Order[] = [
  {
    id: "ORD-1024",
    date: "Apr 14, 2026",
    total: 24.6,
    status: "Pending",
    items: [{ id: "cabbage", qty: 2 }, { id: "apple", qty: 3 }],
  },
  {
    id: "ORD-1019",
    date: "Apr 09, 2026",
    total: 18.2,
    status: "Completed",
    items: [{ id: "milk", qty: 4 }, { id: "rice", qty: 1 }],
  },
  {
    id: "ORD-1014",
    date: "Apr 02, 2026",
    total: 9.5,
    status: "Cancelled",
    items: [{ id: "coffee", qty: 1 }],
  },
  {
    id: "ORD-1008",
    date: "Mar 24, 2026",
    total: 32.1,
    status: "Completed",
    items: [{ id: "ghee", qty: 1 }, { id: "cardamom", qty: 2 }],
  },
];

export const FAVORITES = ["apple", "cherry", "avocado", "broccoli", "coffee", "ghee"];

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id);
