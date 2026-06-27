import { useState, useCallback } from "react";
import { loadData, saveData, generateId, addStockHistory } from "./storage";
import type { AppData, InventoryItem, Category, StockHistory } from "../types";

export function useData() {
  const [data, setData] = useState<AppData>(() => loadData());

  const persist = useCallback((next: AppData) => {
    setData(next);
    saveData(next);
  }, []);

  // Items
  const addItem = useCallback(
    (item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newItem: InventoryItem = {
        ...item,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      const next = { ...data, items: [...data.items, newItem] };
      persist(next);
      return newItem;
    },
    [data, persist]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<Omit<InventoryItem, "id" | "createdAt">>) => {
      const items = data.items.map((it) =>
        it.id === id ? { ...it, ...updates, updatedAt: new Date().toISOString() } : it
      );
      persist({ ...data, items });
    },
    [data, persist]
  );

  const deleteItem = useCallback(
    (id: string) => {
      persist({ ...data, items: data.items.filter((it) => it.id !== id) });
    },
    [data, persist]
  );

  // Stock in/out
  const stockIn = useCallback(
    (itemId: string, qty: number, memo: string) => {
      const item = data.items.find((it) => it.id === itemId);
      if (!item) return;
      const before = item.quantity;
      const after = before + qty;
      let next: AppData = {
        ...data,
        items: data.items.map((it) =>
          it.id === itemId ? { ...it, quantity: after, updatedAt: new Date().toISOString() } : it
        ),
      };
      next = addStockHistory(next, item, "in", qty, before, after, memo);
      persist(next);
    },
    [data, persist]
  );

  const stockOut = useCallback(
    (itemId: string, qty: number, memo: string) => {
      const item = data.items.find((it) => it.id === itemId);
      if (!item) return;
      const before = item.quantity;
      const after = Math.max(0, before - qty);
      let next: AppData = {
        ...data,
        items: data.items.map((it) =>
          it.id === itemId ? { ...it, quantity: after, updatedAt: new Date().toISOString() } : it
        ),
      };
      next = addStockHistory(next, item, "out", qty, before, after, memo);
      persist(next);
    },
    [data, persist]
  );

  const adjustStock = useCallback(
    (itemId: string, newQty: number, memo: string) => {
      const item = data.items.find((it) => it.id === itemId);
      if (!item) return;
      const before = item.quantity;
      let next: AppData = {
        ...data,
        items: data.items.map((it) =>
          it.id === itemId
            ? { ...it, quantity: newQty, updatedAt: new Date().toISOString() }
            : it
        ),
      };
      next = addStockHistory(next, item, "adjust", Math.abs(newQty - before), before, newQty, memo);
      persist(next);
    },
    [data, persist]
  );

  // Categories
  const addCategory = useCallback(
    (name: string, color: string) => {
      const cat: Category = {
        id: generateId(),
        name,
        color,
        createdAt: new Date().toISOString(),
      };
      persist({ ...data, categories: [...data.categories, cat] });
    },
    [data, persist]
  );

  const updateCategory = useCallback(
    (id: string, name: string, color: string) => {
      persist({
        ...data,
        categories: data.categories.map((c) =>
          c.id === id ? { ...c, name, color } : c
        ),
      });
    },
    [data, persist]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      persist({
        ...data,
        categories: data.categories.filter((c) => c.id !== id),
        items: data.items.map((it) =>
          it.categoryId === id ? { ...it, categoryId: "" } : it
        ),
      });
    },
    [data, persist]
  );

  const getHistory = useCallback(
    (itemId?: string): StockHistory[] => {
      if (itemId) return data.history.filter((h) => h.itemId === itemId);
      return data.history;
    },
    [data]
  );

  return {
    data,
    addItem,
    updateItem,
    deleteItem,
    stockIn,
    stockOut,
    adjustStock,
    addCategory,
    updateCategory,
    deleteCategory,
    getHistory,
  };
}
