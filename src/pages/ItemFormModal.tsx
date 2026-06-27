import React, { useState, useEffect } from "react";
import type { InventoryItem, Category } from "../types";
import { IconX } from "../components/Icons";

type Props = {
  item?: InventoryItem | null;
  categories: Category[];
  onSave: (data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
};

const UNITS = ["個", "本", "枚", "冊", "箱", "袋", "缶", "本", "kg", "g", "L", "ml", "セット", "台", "枚", "式", "その他"];

export default function ItemFormModal({ item, categories, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    name: "",
    code: "",
    categoryId: "",
    quantity: 0,
    unit: "個",
    price: 0,
    location: "",
    description: "",
    image: "",
    alertThreshold: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        code: item.code,
        categoryId: item.categoryId,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        location: item.location,
        description: item.description,
        image: item.image,
        alertThreshold: item.alertThreshold,
      });
    }
  }, [item]);

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "アイテム名を入力してください";
    if (form.quantity < 0) e.quantity = "0以上を入力してください";
    if (form.price < 0) e.price = "0以上を入力してください";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ ...form, quantity: Number(form.quantity), price: Number(form.price), alertThreshold: Number(form.alertThreshold) });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <span className="modal-title">{item ? "アイテムを編集" : "新しいアイテムを登録"}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><IconX /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* Name */}
              <div className="form-group form-full">
                <label className="form-label">アイテム名<span className="required">*</span></label>
                <input
                  className={`form-input ${errors.name ? "error" : ""}`}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="例：コピー用紙 A4"
                  autoFocus
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              {/* Code */}
              <div className="form-group">
                <label className="form-label">品番・コード</label>
                <input
                  className="form-input"
                  value={form.code}
                  onChange={(e) => set("code", e.target.value)}
                  placeholder="例：PAPER-A4-001"
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">カテゴリ</label>
                <select
                  className="form-select"
                  value={form.categoryId}
                  onChange={(e) => set("categoryId", e.target.value)}
                >
                  <option value="">カテゴリなし</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="form-group">
                <label className="form-label">数量<span className="required">*</span></label>
                <input
                  type="number"
                  className={`form-input ${errors.quantity ? "error" : ""}`}
                  value={form.quantity}
                  onChange={(e) => set("quantity", e.target.value)}
                  min={0}
                />
                {errors.quantity && <span className="form-error">{errors.quantity}</span>}
              </div>

              {/* Unit */}
              <div className="form-group">
                <label className="form-label">単位</label>
                <select
                  className="form-select"
                  value={form.unit}
                  onChange={(e) => set("unit", e.target.value)}
                >
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              {/* Price */}
              <div className="form-group">
                <label className="form-label">単価（円）</label>
                <input
                  type="number"
                  className={`form-input ${errors.price ? "error" : ""}`}
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  min={0}
                  placeholder="0"
                />
                {errors.price && <span className="form-error">{errors.price}</span>}
              </div>

              {/* Alert threshold */}
              <div className="form-group">
                <label className="form-label">在庫アラート閾値</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.alertThreshold}
                  onChange={(e) => set("alertThreshold", e.target.value)}
                  min={0}
                  placeholder="0"
                />
                <span className="form-hint">この数量以下でアラート（0=無効）</span>
              </div>

              {/* Location */}
              <div className="form-group">
                <label className="form-label">保管場所</label>
                <input
                  className="form-input"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="例：倉庫A-棚1"
                />
              </div>

              {/* Description */}
              <div className="form-group form-full">
                <label className="form-label">メモ・説明</label>
                <textarea
                  className="form-textarea"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="アイテムの詳細説明など"
                  rows={3}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>キャンセル</button>
            <button type="submit" className="btn btn-primary">
              {item ? "変更を保存" : "登録する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
