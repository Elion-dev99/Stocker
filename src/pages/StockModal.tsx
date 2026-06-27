import React, { useState } from "react";
import type { InventoryItem } from "../types";
import { IconX } from "../components/Icons";

type Props = {
  item: InventoryItem;
  onStockIn: (qty: number, memo: string) => void;
  onStockOut: (qty: number, memo: string) => void;
  onAdjust: (qty: number, memo: string) => void;
  onClose: () => void;
};

type TabType = "in" | "out" | "adjust";

export default function StockModal({ item, onStockIn, onStockOut, onAdjust, onClose }: Props) {
  const [tab, setTab] = useState<TabType>("in");
  const [qty, setQty] = useState(1);
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const n = Number(qty);
    if (!n || n < 0) {
      setError("1以上の数量を入力してください");
      return;
    }
    if (tab === "in") onStockIn(n, memo);
    else if (tab === "out") {
      if (n > item.quantity) {
        setError(`現在の在庫数(${item.quantity})を超えて出庫できません`);
        return;
      }
      onStockOut(n, memo);
    } else {
      onAdjust(n, memo);
    }
    onClose();
  };

  const preview = tab === "in"
    ? item.quantity + Number(qty || 0)
    : tab === "out"
    ? Math.max(0, item.quantity - Number(qty || 0))
    : Number(qty || 0);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">入出庫登録</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><IconX /></button>
        </div>
        <div className="modal-body">
          {/* Item info */}
          <div style={{ background: "#f5f6fa", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{item.name}</div>
            <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#666" }}>
              <span>現在庫: <strong style={{ color: "#1a1a1a" }}>{item.quantity} {item.unit}</strong></span>
              {item.location && <span>保管場所: {item.location}</span>}
            </div>
          </div>

          {/* Tabs */}
          <div className="stock-type-tabs">
            <button
              type="button"
              className={`stock-type-tab ${tab === "in" ? "active-in" : ""}`}
              onClick={() => { setTab("in"); setError(""); setQty(1); }}
            >
              入庫
            </button>
            <button
              type="button"
              className={`stock-type-tab ${tab === "out" ? "active-out" : ""}`}
              onClick={() => { setTab("out"); setError(""); setQty(1); }}
            >
              出庫
            </button>
            <button
              type="button"
              className={`stock-type-tab ${tab === "adjust" ? "active-adjust" : ""}`}
              onClick={() => { setTab("adjust"); setError(""); setQty(item.quantity); }}
            >
              棚卸（数量調整）
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">
                {tab === "adjust" ? "調整後の数量" : "数量"}
                <span className="required">*</span>
              </label>
              <div className="qty-ctrl">
                <button type="button" onClick={() => setQty((q) => Math.max(0, Number(q) - 1))}>−</button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  min={0}
                  style={{ width: 80 }}
                />
                <button type="button" onClick={() => setQty((q) => Number(q) + 1)}>+</button>
                <span style={{ marginLeft: 4, color: "#666", fontSize: 13 }}>{item.unit}</span>
              </div>
              {error && <span className="form-error">{error}</span>}
            </div>

            {/* Preview */}
            <div style={{ background: "#f5f6fa", borderRadius: 8, padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#666" }}>変更後の在庫数</span>
              <span style={{ fontWeight: 700, fontSize: 16, color: preview === 0 ? "#999" : preview <= (item.alertThreshold || 0) ? "#e53935" : "#1a1a1a" }}>
                {preview} {item.unit}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">メモ</label>
              <input
                className="form-input"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="例：定期補充、破損など"
              />
            </div>

            <div className="modal-footer" style={{ padding: "16px 0 0", margin: "0" }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>キャンセル</button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  background: tab === "out" ? "#e53935" : tab === "adjust" ? "#2196f3" : undefined,
                  borderColor: tab === "out" ? "#c62828" : tab === "adjust" ? "#1565c0" : undefined,
                }}
              >
                {tab === "in" ? "入庫する" : tab === "out" ? "出庫する" : "数量を調整する"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
