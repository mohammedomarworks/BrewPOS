export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  sku?: string;
  description?: string;
  available?: boolean;
  popular?: boolean;
  isNew?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt?: string;
};

export const initialCategories: Category[] = [
  {
    id: "hot-coffee",
    name: "Hot Coffee",
    description: "Freshly brewed espresso and artisan hot beverages",
    active: true,
  },
  {
    id: "cold-coffee",
    name: "Cold Coffee",
    description: "Chilled iced coffees, cold brews, and frappes",
    active: true,
  },
  {
    id: "tea",
    name: "Tea",
    description: "Premium loose-leaf teas and herbal infusions",
    active: true,
  },
  {
    id: "bakery",
    name: "Bakery",
    description: "Freshly baked croissants, pastries, and savory breads",
    active: true,
  },
  {
    id: "desserts",
    name: "Desserts",
    description: "Handcrafted cakes, muffins, and sweet indulgences",
    active: true,
  },
];

export const products: Product[] = [
  {
    id: 1,
    name: "Cappuccino",
    category: "Hot Coffee",
    price: 180,
    image: "☕",
    sku: "HOT-CAP-001",
    description: "Rich espresso with steamed milk foam and chocolate dusting",
    available: true,
    popular: true,
    isNew: false,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: 2,
    name: "Americano",
    category: "Hot Coffee",
    price: 150,
    image: "☕",
    sku: "HOT-AME-002",
    description: "Bold double shot espresso lengthened with hot water",
    available: true,
    popular: false,
    isNew: false,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: 3,
    name: "Caffe Latte",
    category: "Hot Coffee",
    price: 190,
    image: "🥛",
    sku: "HOT-LAT-003",
    description: "Velvety steamed milk over a smooth espresso base",
    available: true,
    popular: true,
    isNew: false,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: 4,
    name: "Mocha",
    category: "Hot Coffee",
    price: 210,
    image: "🍫",
    sku: "HOT-MOC-004",
    description: "Espresso combined with rich Dutch dark chocolate and milk",
    available: true,
    popular: false,
    isNew: true,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: 5,
    name: "Iced Latte",
    category: "Cold Coffee",
    price: 220,
    image: "🧊",
    sku: "COL-LAT-005",
    description: "Smooth espresso poured over ice-cold fresh milk",
    available: true,
    popular: false,
    isNew: false,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: 6,
    name: "Cold Brew",
    category: "Cold Coffee",
    price: 240,
    image: "🧋",
    sku: "COL-BRW-006",
    description: "Slow-steeped for 18 hours for maximum smoothness and depth",
    available: true,
    popular: false,
    isNew: true,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: 7,
    name: "Butter Croissant",
    category: "Bakery",
    price: 140,
    image: "🥐",
    sku: "BAK-CRO-007",
    description: "Traditional flaky French pastry baked golden with pure butter",
    available: true,
    popular: false,
    isNew: false,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: 8,
    name: "Blueberry Muffin",
    category: "Bakery",
    price: 160,
    image: "🧁",
    sku: "BAK-MUF-008",
    description: "Moist vanilla muffin bursting with fresh wild blueberries",
    available: true,
    popular: false,
    isNew: false,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  },
];
