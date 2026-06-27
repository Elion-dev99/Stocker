import React, { useState, useMemo } from "react";
import type { InventoryItem, Category } from "../types";
import {
  IconSearch, IconPlus, IconEdit, IconTrash, IconArrowDown, IconArrowUp, IconRefresh, IconDownload, IconAlert
} from "../components/Icons";
import ItemFormModal from "./ItemFormModal";
import StockModal from "./StockModal";

type Props = {
  items: InventoryItem[];
  categories: Category[];
  onAdd: (data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => void;
  onUpdate: (id: string, data: Partial<Omit<InventoryItem, "id" | "createdAt">>) => void;
  onDelete: (id: string) => void;
  onStockIn: (id: string, qty: number, memo: string) => void;
  onStockOut: (id: string, qty: number, memo: string) => void;
  onAdjust: (id: string, qty: number, memo: string) => void;
};

export default function Inventory({ items, categories, onAdd, onUpdate, onDelete, onStockIn, onStockOut, onAdjust }: Props) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "zero">("all");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [stockItem, setStockItem] = useState<InventoryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<InventoryItem | null>(null);

  const filtered = useMemo(() => {
    let list = items;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((it) =>
        it.name.toLowerCase().includes(q) ||
        it.code.toLowerCase().includes(q) ||
        it.location.toLowerCase().includes(q)
      );
    }
    if (catFilter) list = list.filter((it) => it.categoryId === catFilter);
    if (stockFilter === "low") list = list.filter((it) => it.quantity <= it.alertThreshold && it.alertThreshold > 0);
    if (stockFilter === "zero") list = list.filter((it) => it.quantity === 0);
    return list;
  }, [items, search, catFilter, stockFilter]);

  const exportCSV = () => {
    const header = ["アイテム名", "品番", "カテゴリ", "数量", "単位", "単価(円)", "在庫評価額", "保管場所", "アラート閾値", "説明", "更新日時"];
    const rows = items.map((it) => {
      const cat = categories.find((c) => c.id === it.categoryId);
      return [
        it.name, it.code, cat?.name || "", it.quantity, it.unit, it.price, it.price * it.quantity,
        it.location, it.alertThreshold, it.description, new Date(it.updatedAt).toLocaleString("ja-JP")
      ];
    });
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `在庫データ_${new Date().toLocaleDateString("ja-JP").replace(/\//g, "-")}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const lowCount = items.filter((it) => it.quantity <= it.alertThreshold && it.alertThreshold > 0).length;

  return (
    <div>
      {/* Alert bar */}
      {lowCount > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 16 }}>
          <IconAlert size={16} />
          <span><strong>{lowCount}件</strong>のアイテムが在庫不足です。確認してください。</span>
        </div>
      )}

      {/* Search & filter toolbar */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ padding: "14px 16px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div className="search-input-wrap" style={{ maxWidth: 320 }}>
            <IconSearch size={15} />
            <input
              type="search"
              className="search-input"
              placeholder="アイテム名・品番・保管場所で検索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="select-filter" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="">すべてのカテゴリ</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="select-filter" value={stockFilter} onChange={(e) => setStockFilter(e.target.value as "all" | "low" | "zero")}>
            <option value="all">すべての在庫状態</option>
            <option value="low">在庫不足のみ</option>
            <option value="zero">在庫ゼロのみ</option>
          </select>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button className="btn btn-outline btn-sm export-btn" onClick={exportCSV}>
              <IconDownload size={14} /> CSV出力
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setShowForm(true); }}>
              <IconPlus size={14} /> 新規登録
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">在庫一覧</span>
          <span style={{ fontSize: 13, color: "#999" }}>{filtered.length}件 / 全{items.length}件</span>
        </div>
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <IconSearch size={28} color="#ccc" />
              </div>
              <h3>アイテムが見つかりません</h3>
              <p>検索条件を変えるか、新しいアイテムを登録してください。</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>アイテム名</th>
                  <th>カテゴリ</th>
                  <th style={{ textAlign: "right" }}>在庫数</th>
                  <th style={{ textAlign: "right" }}>単価</th>
                  <th style={{ textAlign: "right" }}>在庫評価額</th>
                  <th>保管場所</th>
                  <th>状態</th>
                  <th style={{ textAlign: "right" }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const cat = categories.find((c) => c.id === item.categoryId);
                  const isLow = item.alertThreshold > 0 && item.quantity <= item.alertThreshold;
                  const isZero = item.quantity === 0;
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="item-name-cell">
                          <span className="item-name">{item.name}</span>
                          {item.code && <span className="item-code">{item.code}</span>}
                        </div>
                      </td>
                      <td>
                        {cat ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <span className="category-dot" style={{ background: cat.color }} />
                            <span style={{ fontSize: 13 }}>{cat.name}</span>
                          </span>
                        ) : <span style={{ color: "#ccc" }}>—</span>}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span className={`qty-display ${isZero ? "qty-zero" : isLow ? "qty-low" : "qty-ok"}`}>
                          {item.quantity}
                        </span>
                        <span style={{ color: "#999", fontSize: 12, marginLeft: 2 }}>{item.unit}</span>
                      </td>
                      <td style={{ textAlign: "right", fontSize: 13 }}>
                        {item.price > 0 ? `¥${item.price.toLocaleString()}` : <span style={{ color: "#ccc" }}>—</span>}
                      </td>
                      <td style={{ textAlign: "right", fontSize: 13, fontWeight: 600 }}>
                        {item.price > 0 ? `¥${(item.price * item.quantity).toLocaleString()}` : <span style={{ color: "#ccc" }}>—</span>}
                      </td>
                      <td style={{ fontSize: 13, color: "#666" }}>{item.location || <span style={{ color: "#ccc" }}>—</span>}</td>
                      <td>
                        {isZero ? (
                          <span className="badge badge-gray">在庫切れ</span>
                        ) : isLow ? (
                          <span className="badge badge-red">在庫不足</span>
                        ) : (
                          <span className="badge badge-green">正常</span>
                        )}
                      </td>
                      <td>
                        <div className="td-actions">
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            title="入庫"
                            onClick={() => setStockItem(item)}
                            style={{ color: "#00b300" }}
                          >
                            <IconArrowDown size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            title="出庫"
                            onClick={() => setStockItem(item)}
                            style={{ color: "#e53935" }}
                          >
                            <IconArrowUp size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            title="棚卸"
                            onClick={() => setStockItem(item)}
                            style={{ color: "#2196f3" }}
                          >
                            <IconRefresh size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            title="編集"
                            onClick={() => { setEditItem(item); setShowForm(true); }}
                          >
                            <IconEdit size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            title="削除"
                            onClick={() => setDeleteConfirm(item)}
                            style={{ color: "#e53935" }}
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Item form modal */}
      {showForm && (
        <ItemFormModal
          item={editItem}
          categories={categories}
          onSave={(data) => {
            if (editItem) onUpdate(editItem.id, data);
            else onAdd(data);
            setShowForm(false);
            setEditItem(null);
          }}
          onClose={() => { setShowForm(false); setEditItem(null); }}
        />
      )}

      {/* Stock modal */}
      {stockItem && (
        <StockModal
          item={stockItem}
          onStockIn={(qty, memo) => onStockIn(stockItem.id, qty, memo)}
          onStockOut={(qty, memo) => onStockOut(stockItem.id, qty, memo)}
          onAdjust={(qty, memo) => onAdjust(stockItem.id, qty, memo)}
          onClose={() => setStockItem(null)}
        />
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title">アイテムを削除</span>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                <strong>「{deleteConfirm.name}」</strong>を削除しますか？<br />
                この操作は取り消せません。
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>キャンセル</button>
              <button className="btn btn-danger" onClick={() => { onDelete(deleteConfirm.id); setDeleteConfirm(null); }}>
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
