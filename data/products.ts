export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  popular?: boolean;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Cappuccino",
    category: "Hot Coffee",
    price: 180,
    image: "/products/cappuccino.jpg",
    popular: true,
  },
  {
    id: 2,
    name: "Americano",
    category: "Hot Coffee",
    price: 150,
    image: "/products/americano.jpg",
  },
  {
    id: 3,
    name: "Caffe Latte",
    category: "Hot Coffee",
    price: 190,
    image: "/products/latte.jpg",
    popular: true,
  },
  {
    id: 4,
    name: "Mocha",
    category: "Hot Coffee",
    price: 210,
    image: "/products/mocha.jpg",
  },
  {
    id: 5,
    name: "Iced Latte",
    category: "Cold Coffee",
    price: 220,
    image: "/products/iced-latte.jpg",
  },
  {
    id: 6,
    name: "Cold Brew",
    category: "Cold Coffee",
    price: 240,
    image: "/products/cold-brew.jpg",
  },
  {
    id: 7,
    name: "Butter Croissant",
    category: "Bakery",
    price: 140,
    image: "/products/croissant.jpg",
  },
  {
    id: 8,
    name: "Blueberry Muffin",
    category: "Bakery",
    price: 160,
    image: "/products/muffin.jpg",
  },
];