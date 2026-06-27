import React, { useState } from "react";
import { useData } from "./lib/useData";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Categories from "./pages/Categories";
import History from "./pages/History";
import {
  IconDashboard, IconList, IconTag, IconHistory, IconBox
} from "./components/Icons";

type Page = "dashboard" | "inventory" | "categories" | "history";

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "ダッシュボード", icon: <IconDashboard /> },
  { id: "inventory", label: "在庫一覧", icon: <IconList /> },
  { id: "categories", label: "カテゴリ管理", icon: <IconTag /> },
  { id: "history", label: "入出庫履歴", icon: <IconHistory /> },
];

const PAGE_TITLES: Record<Page, string> = {
  dashboard: "ダッシュボード",
  inventory: "在庫一覧",
  categories: "カテゴリ管理",
  history: "入出庫履歴",
};

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const {
    data,
    addItem, updateItem, deleteItem,
    stockIn, stockOut, adjustStock,
    addCategory, updateCategory, deleteCategory,
  } = useData();

  const lowStockCount = data.items.filter(
    (it) => it.alertThreshold > 0 && it.quantity <= it.alertThreshold
  ).length;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">Z</div>
          <span className="sidebar-logo-text">zaico</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-label">メニュー</div>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${page === item.id ? "active" : ""}`}
                onClick={() => setPage(item.id)}
              >
                {item.icon}
                {item.label}
                {item.id === "inventory" && lowStockCount > 0 && (
                  <span className="nav-badge">{lowStockCount}</span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Footer info */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #e0e0e0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e6f9e6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconBox size={18} color="#00b300" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>在庫数</div>
              <div style={{ fontSize: 12, color: "#999" }}>{data.items.length}種類のアイテム</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="top-bar">
          <h1 className="page-title">{PAGE_TITLES[page]}</h1>
        </header>

        <main className="page-body">
          {page === "dashboard" && (
            <Dashboard data={data} onNavigate={(p) => setPage(p as Page)} />
          )}
          {page === "inventory" && (
            <Inventory
              items={data.items}
              categories={data.categories}
              onAdd={addItem}
              onUpdate={updateItem}
              onDelete={deleteItem}
              onStockIn={stockIn}
              onStockOut={stockOut}
              onAdjust={adjustStock}
            />
          )}
          {page === "categories" && (
            <Categories
              categories={data.categories}
              items={data.items}
              onAdd={addCategory}
              onUpdate={updateCategory}
              onDelete={deleteCategory}
            />
          )}
          {page === "history" && (
            <History history={data.history} items={data.items} />
          )}
        </main>
      </div>
    </div>
  );
}
