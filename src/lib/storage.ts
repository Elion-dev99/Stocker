import type { AppData, InventoryItem, Category, StockHistory } from "../types";

const STORAGE_KEY = "zaico_data";

const defaultCategories: Category[] = [
  { id: "cat1", name: "食品・飲料", color: "#4CAF50", createdAt: new Date().toISOString() },
  { id: "cat2", name: "消耗品", color: "#2196F3", createdAt: new Date().toISOString() },
  { id: "cat3", name: "電子機器", color: "#9C27B0", createdAt: new Date().toISOString() },
  { id: "cat4", name: "オフィス用品", color: "#FF9800", createdAt: new Date().toISOString() },
  { id: "cat5", name: "その他", color: "#607D8B", createdAt: new Date().toISOString() },
];

const defaultItems: InventoryItem[] = [
  {
    id: "item1",
    name: "コピー用紙 A4",
    code: "PAPER-A4-001",
    categoryId: "cat4",
    quantity: 15,
    unit: "冊",
    price: 500,
    location: "倉庫A-棚1",
    description: "500枚入り A4コピー用紙",
    image: "",
    alertThreshold: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item2",
    name: "ボールペン 黒",
    code: "PEN-BLK-001",
    categoryId: "cat4",
    quantity: 3,
    unit: "本",
    price: 150,
    location: "デスク引き出し",
    description: "0.7mm 黒ボールペン",
    image: "",
    alertThreshold: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item3",
    name: "緑茶ペットボトル 500ml",
    code: "DRINK-TEA-500",
    categoryId: "cat1",
    quantity: 24,
    unit: "本",
    price: 120,
    location: "冷蔵庫",
    description: "500ml ペットボトル緑茶",
    image: "",
    alertThreshold: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item4",
    name: "アルコール除菌スプレー",
    code: "CLEAN-ALC-500",
    categoryId: "cat2",
    quantity: 2,
    unit: "本",
    price: 800,
    location: "洗面台下",
    description: "500ml アルコール除菌スプレー",
    image: "",
    alertThreshold: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item5",
    name: "USBメモリ 32GB",
    code: "USB-32G-001",
    categoryId: "cat3",
    quantity: 8,
    unit: "個",
    price: 1200,
    location: "倉庫A-棚2",
    description: "USB 3.0 32GBメモリ",
    image: "",
    alertThreshold: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as AppData;
    }
  } catch {
    // ignore
  }
  const defaultData: AppData = {
    items: defaultItems,
    categories: defaultCategories,
    history: [],
  };
  saveData(defaultData);
  return defaultData;
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export function addStockHistory(
  data: AppData,
  item: InventoryItem,
  type: StockHistory["type"],
  quantity: number,
  beforeQty: number,
  afterQty: number,
  memo: string
): AppData {
  const entry: StockHistory = {
    id: generateId(),
    itemId: item.id,
    itemName: item.name,
    type,
    quantity,
    beforeQuantity: beforeQty,
    afterQuantity: afterQty,
    memo,
    date: new Date().toISOString(),
  };
  return { ...data, history: [entry, ...data.history] };
}
