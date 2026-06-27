import React, { useState } from "react";
import type { Category, InventoryItem } from "../types";
import { IconPlus, IconEdit, IconTrash, IconX, IconCheck } from "../components/Icons";

type Props = {
  categories: Category[];
  items: InventoryItem[];
  onAdd: (name: string, color: string) => void;
  onUpdate: (id: string, name: string, color: string) => void;
  onDelete: (id: string) => void;
};

const COLORS = [
  "#4CAF50", "#2196F3", "#9C27B0", "#FF9800", "#607D8B",
  "#F44336", "#E91E63", "#00BCD4", "#FF5722", "#795548",
  "#009688", "#3F51B5", "#CDDC39", "#FFC107", "#8BC34A",
];

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="color-picker-row">
      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          className={`color-swatch ${value === c ? "selected" : ""}`}
          style={{ background: c }}
          onClick={() => onChange(c)}
        />
      ))}
    </div>
  );
}

export default function Categories({ categories, items, onAdd, onUpdate, onDelete }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [nameError, setNameError] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) { setNameError("カテゴリ名を入力してください"); return; }
    onAdd(newName.trim(), newColor);
    setNewName(""); setNewColor(COLORS[0]); setShowAdd(false); setNameError("");
  };

  const startEdit = (c: Category) => {
    setEditId(c.id); setEditName(c.name); setEditColor(c.color);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    onUpdate(editId!, editName.trim(), editColor);
    setEditId(null);
  };

  const itemCountFor = (id: string) => items.filter((it) => it.categoryId === id).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
          <IconPlus size={14} /> 新規カテゴリ
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <span className="card-title">新しいカテゴリを追加</span>
            <button className="btn btn-ghost btn-icon" onClick={() => setShowAdd(false)}><IconX /></button>
          </div>
          <form onSubmit={handleAdd}>
            <div className="card-body">
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">カテゴリ名<span className="required">*</span></label>
                <input
                  className={`form-input ${nameError ? "error" : ""}`}
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setNameError(""); }}
                  placeholder="例：食品・飲料"
                  autoFocus
                  style={{ maxWidth: 320 }}
                />
                {nameError && <span className="form-error">{nameError}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">カラー</label>
                <ColorPicker value={newColor} onChange={setNewColor} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>キャンセル</button>
              <button type="submit" className="btn btn-primary">追加する</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">カテゴリ一覧</span>
          <span style={{ fontSize: 13, color: "#999" }}>{categories.length}件</span>
        </div>
        {categories.length === 0 ? (
          <div className="empty-state">
            <h3>カテゴリがありません</h3>
            <p>「新規カテゴリ」ボタンから追加できます。</p>
          </div>
        ) : (
          <div>
            {categories.map((cat) => {
              const count = itemCountFor(cat.id);
              const isEditing = editId === cat.id;
              return (
                <div key={cat.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 20px",
                  borderBottom: "1px solid #f0f0f0",
                }}>
                  {isEditing ? (
                    <form onSubmit={saveEdit} style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, flexWrap: "wrap" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: editColor + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span className="category-dot" style={{ background: editColor, width: 14, height: 14 }} />
                      </div>
                      <input
                        className="form-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ width: 180 }}
                        autoFocus
                      />
                      <ColorPicker value={editColor} onChange={setEditColor} />
                      <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                        <button type="submit" className="btn btn-primary btn-sm"><IconCheck size={13} /> 保存</button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>キャンセル</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span className="category-dot" style={{ background: cat.color, width: 14, height: 14 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{cat.name}</div>
                        <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                          {count}件のアイテム
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => startEdit(cat)} title="編集">
                          <IconEdit size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => setDeleteConfirm(cat)}
                          title="削除"
                          style={{ color: "#e53935" }}
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title">カテゴリを削除</span>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                <strong>「{deleteConfirm.name}」</strong>を削除しますか？<br />
                このカテゴリに属するアイテム（{itemCountFor(deleteConfirm.id)}件）のカテゴリは「未分類」になります。
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>キャンセル</button>
              <button className="btn btn-danger" onClick={() => { onDelete(deleteConfirm.id); setDeleteConfirm(null); }}>削除する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
