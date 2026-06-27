import React, { useState, useMemo } from "react";
import type { StockHistory, InventoryItem } from "../types";
import { IconSearch, IconArrowDown, IconArrowUp, IconRefresh, IconDownload } from "../components/Icons";

type Props = {
  history: StockHistory[];
  items: InventoryItem[];
};

export default function History({ history, items }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "in" | "out" | "adjust">("");
  const [itemFilter, setItemFilter] = useState("");

  const filtered = useMemo(() => {
    let list = history;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((h) => h.itemName.toLowerCase().includes(q) || h.memo.toLowerCase().includes(q));
    }
    if (typeFilter) list = list.filter((h) => h.type === typeFilter);
    if (itemFilter) list = list.filter((h) => h.itemId === itemFilter);
    return list;
  }, [history, search, typeFilter, itemFilter]);

  const exportCSV = () => {
    const header = ["日時", "アイテム名", "種別", "数量", "変更前", "変更後", "メモ"];
    const typeLabel = (t: string) => t === "in" ? "入庫" : t === "out" ? "出庫" : "棚卸";
    const rows = filtered.map((h) => [
      new Date(h.date).toLocaleString("ja-JP"),
      h.itemName,
      typeLabel(h.type),
      h.quantity,
      h.beforeQuantity,
      h.afterQuantity,
      h.memo,
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `入出庫履歴_${new Date().toLocaleDateString("ja-JP").replace(/\//g, "-")}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const typeLabel = (t: string) => {
    if (t === "in") return <span className="history-in" style={{ display: "flex", alignItems: "center", gap: 4 }}><IconArrowDown size={13} />入庫</span>;
    if (t === "out") return <span className="history-out" style={{ display: "flex", alignItems: "center", gap: 4 }}><IconArrowUp size={13} />出庫</span>;
    return <span className="history-adjust" style={{ display: "flex", alignItems: "center", gap: 4 }}><IconRefresh size={13} />棚卸</span>;
  };

  const qtyDiff = (h: StockHistory) => {
    const diff = h.afterQuantity - h.beforeQuantity;
    if (diff > 0) return <span style={{ color: "#00b300", fontWeight: 700 }}>+{diff}</span>;
    if (diff < 0) return <span style={{ color: "#e53935", fontWeight: 700 }}>{diff}</span>;
    return <span style={{ color: "#999" }}>±0</span>;
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ padding: "14px 16px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div className="search-input-wrap" style={{ maxWidth: 280 }}>
            <IconSearch size={15} />
            <input
              type="search"
              className="search-input"
              placeholder="アイテム名・メモで検索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="select-filter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as "" | "in" | "out" | "adjust")}>
            <option value="">すべての種別</option>
            <option value="in">入庫</option>
            <option value="out">出庫</option>
            <option value="adjust">棚卸</option>
          </select>
          <select className="select-filter" value={itemFilter} onChange={(e) => setItemFilter(e.target.value)}>
            <option value="">すべてのアイテム</option>
            {items.map((it) => <option key={it.id} value={it.id}>{it.name}</option>)}
          </select>
          <button className="btn btn-outline btn-sm export-btn" style={{ marginLeft: "auto" }} onClick={exportCSV}>
            <IconDownload size={14} /> CSV出力
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">入出庫履歴</span>
          <span style={{ fontSize: 13, color: "#999" }}>{filtered.length}件</span>
        </div>
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <IconSearch size={28} color="#ccc" />
              </div>
              <h3>履歴がありません</h3>
              <p>在庫一覧から入出庫操作をすると、ここに記録されます。</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>日時</th>
                  <th>アイテム名</th>
                  <th>種別</th>
                  <th style={{ textAlign: "right" }}>数量</th>
                  <th style={{ textAlign: "right" }}>変更前</th>
                  <th style={{ textAlign: "right" }}>変更後</th>
                  <th style={{ textAlign: "right" }}>差分</th>
                  <th>メモ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((h) => (
                  <tr key={h.id}>
                    <td style={{ color: "#666", fontSize: 12, whiteSpace: "nowrap" }}>
                      <div>{new Date(h.date).toLocaleDateString("ja-JP")}</div>
                      <div style={{ color: "#aaa" }}>{new Date(h.date).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{h.itemName}</td>
                    <td>{typeLabel(h.type)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{h.quantity}</td>
                    <td style={{ textAlign: "right", color: "#999" }}>{h.beforeQuantity}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{h.afterQuantity}</td>
                    <td style={{ textAlign: "right" }}>{qtyDiff(h)}</td>
                    <td style={{ fontSize: 13, color: "#666" }}>{h.memo || <span style={{ color: "#ccc" }}>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
