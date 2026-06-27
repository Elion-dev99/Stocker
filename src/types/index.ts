export type Category = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  description: string;
  image: string;
  alertThreshold: number;
  createdAt: string;
  updatedAt: string;
};

export type StockHistory = {
  id: string;
  itemId: string;
  itemName: string;
  type: "in" | "out" | "adjust";
  quantity: number;
  beforeQuantity: number;
  afterQuantity: number;
  memo: string;
  date: string;
};

export type AppData = {
  items: InventoryItem[];
  categories: Category[];
  history: StockHistory[];
};
