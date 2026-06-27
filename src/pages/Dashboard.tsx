import React from "react";
import type { AppData } from "../types";
import {
  IconBox, IconAlert, IconArrowDown, IconArrowUp, IconHistory, IconChevronRight
} from "../components/Icons";

type Props = {
  data: AppData;
  onNavigate: (page: string) => void;
};

export default function Dashboard({ data, onNavigate }: Props) {
  const { items, categories, history } = data;

  const totalItems = items.length;
  const totalValue = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const lowStock = items.filter((it) => it.quantity <= it.alertThreshold && it.alertThreshold > 0);
  const zeroStock = items.filter((it) => it.quantity === 0);

  const recentHistory = history.slice(0, 8);

  const catCounts = categories.map((c) => ({
    ...c,
    count: items.filter((it) => it.categoryId === c.id).length,
  })).filter(c => c.count > 0);

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e6f9e6" }}>
            <IconBox size={24} color="#00b300" />
          </div>
          <div className="stat-info">
            <div className="stat-label">登録アイテム数</div>
            <div className="stat-value">{totalItems}</div>
            <div className="stat-sub">種類のアイテム</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fdecea" }}>
            <IconAlert size={24} color="#e53935" />
          </div>
          <div className="stat-info">
            <div className="stat-label">在庫不足</div>
            <div className="stat-value" style={{ color: lowStock.length > 0 ? "#e53935" : "#1a1a1a" }}>
              {lowStock.length}
            </div>
            <div className="stat-sub">アラート中のアイテム</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e3f2fd" }}>
            <IconBox size={24} color="#2196f3" />
          </div>
          <div className="stat-info">
            <div className="stat-label">在庫ゼロ</div>
            <div className="stat-value" style={{ color: zeroStock.length > 0 ? "#f59e0b" : "#1a1a1a" }}>
              {zeroStock.length}
            </div>
            <div className="stat-sub">在庫切れアイテム</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fff3e0" }}>
            <span style={{ fontSize: 20 }}>¥</span>
          </div>
          <div className="stat-info">
            <div className="stat-label">在庫総額</div>
            <div className="stat-value" style={{ fontSize: 20 }}>
              ¥{totalValue.toLocaleString()}
            </div>
            <div className="stat-sub">現在の在庫評価額</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Low Stock Alert */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <IconAlert size={16} color="#e53935" />
              在庫不足アラート
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("inventory")}>
              すべて見る <IconChevronRight size={14} />
            </button>
          </div>
          <div>
            {lowStock.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#999", fontSize: 13 }}>
                在庫不足のアイテムはありません
              </div>
            ) : (
              <table style={{ width: "100%" }}>
                <tbody>
                  {lowStock.slice(0, 5).map((item) => {
                    const cat = categories.find((c) => c.id === item.categoryId);
                    return (
                      <tr key={item.id}>
                        <td style={{ padding: "10px 16px", borderBottom: "1px solid #f0f0f0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {cat && <span className="category-dot" style={{ background: cat.color }} />}
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                              <div style={{ fontSize: 11, color: "#999" }}>{item.location || "—"}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "10px 16px", borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>
                          <span className={`qty-display ${item.quantity === 0 ? "qty-zero" : "qty-low"}`}>
                            {item.quantity}
                          </span>
                          <span style={{ color: "#999", fontSize: 12, marginLeft: 2 }}>{item.unit}</span>
                        </td>
                        <td style={{ padding: "10px 16px", borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>
                          <span className={`badge ${item.quantity === 0 ? "badge-gray" : "badge-red"}`}>
                            {item.quantity === 0 ? "在庫切れ" : "在庫不足"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent History */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <IconHistory size={16} color="#666" />
              最近の入出庫
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("history")}>
              すべて見る <IconChevronRight size={14} />
            </button>
          </div>
          <div>
            {recentHistory.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#999", fontSize: 13 }}>
                入出庫履歴がありません
              </div>
            ) : (
              <table style={{ width: "100%" }}>
                <tbody>
                  {recentHistory.map((h) => {
                    const typeLabel = h.type === "in" ? "入庫" : h.type === "out" ? "出庫" : "調整";
                    const typeClass = `history-${h.type}`;
                    return (
                      <tr key={h.id}>
                        <td style={{ padding: "10px 16px", borderBottom: "1px solid #f0f0f0" }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{h.itemName}</div>
                          <div style={{ fontSize: 11, color: "#999" }}>
                            {new Date(h.date).toLocaleDateString("ja-JP")} {new Date(h.date).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>
                        <td style={{ padding: "10px 16px", borderBottom: "1px solid #f0f0f0", textAlign: "center" }}>
                          <span className={typeClass}>{typeLabel}</span>
                        </td>
                        <td style={{ padding: "10px 16px", borderBottom: "1px solid #f0f0f0", textAlign: "right", fontWeight: 600 }}>
                          {h.type === "in" ? (
                            <span style={{ color: "#00b300", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3 }}>
                              <IconArrowDown size={13} color="#00b300" />+{h.quantity}
                            </span>
                          ) : h.type === "out" ? (
                            <span style={{ color: "#e53935", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3 }}>
                              <IconArrowUp size={13} color="#e53935" />-{h.quantity}
                            </span>
                          ) : (
                            <span style={{ color: "#2196f3" }}>→{h.afterQuantity}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      {catCounts.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <span className="card-title">カテゴリ別在庫</span>
          </div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
              {catCounts.map((c) => (
                <div
                  key={c.id}
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                  }}
                  onClick={() => onNavigate("inventory")}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: c.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="category-dot" style={{ background: c.color, width: 12, height: 12 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>{c.name}</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{c.count}<span style={{ fontSize: 11, color: "#999", marginLeft: 2 }}>種類</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
