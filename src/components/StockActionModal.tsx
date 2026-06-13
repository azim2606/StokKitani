import React, { useState, useEffect } from "react";
import { X, ArrowDownRight, ArrowUpRight, AlertTriangle } from "lucide-react";
import { Item, Language, translations } from "../types";

interface StockActionModalProps {
  isOpen: boolean;
  type: "stock_in" | "stock_out" | null;
  item: Item | null;
  onClose: () => void;
  onSubmit: (quantity: number, remarks: string) => Promise<boolean>;
  language: Language;
}

export default function StockActionModal({
  isOpen,
  type,
  item,
  onClose,
  onSubmit,
  language,
}: StockActionModalProps) {
  const t = translations[language];

  const [quantity, setQuantity] = useState<number>(1);
  const [remarks, setRemarks] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setQuantity(1);
    setRemarks("");
    setError("");
  }, [isOpen, item, type]);

  if (!isOpen || !item || !type) return null;

  const isStockIn = type === "stock_in";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (quantity <= 0) {
      setError(language === "en" ? "Quantity must be greater than zero" : "Kuantiti hendaklah melebihi sifar");
      return;
    }

    if (!isStockIn && item.quantity < quantity) {
      setError(t.insufficientStock);
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit(quantity, remarks.trim());
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to record stock movement logs");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
        {/* Header decoration */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 ${
            isStockIn ? "bg-emerald-50/50" : "bg-red-50/50"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                isStockIn ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
              }`}
            >
              {isStockIn ? <ArrowUpRight className="h-4.5 w-4.5" /> : <ArrowDownRight className="h-4.5 w-4.5" />}
            </div>
            <h3 className="text-sm font-extrabold text-brand-dark">
              {isStockIn ? t.stockIn : t.stockOut} — <span className="text-[#C9A227]">{item.sku}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current balance display info board */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-gray-800">{item.name}</p>
              <p className="text-[10px] text-gray-400 font-semibold">{item.category}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-extrabold tracking-wider text-gray-400 block uppercase">
                {language === "en" ? "Current Stock" : "Stok Semasa"}
              </span>
              <span className="text-sm font-black text-gray-800">{item.quantity}</span>
            </div>
          </div>

          {/* Validation Alert */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-2.5 text-xs font-bold text-red-700 border border-red-100">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Qty Input field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {t.quantityToChange} *
            </label>
            <input
              id="stock-qty-input"
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-bold text-gray-800 focus:border-brand-gold focus:outline-hidden transition"
            />
          </div>

          {/* Remarks input field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {t.remarks}
            </label>
            <input
              id="stock-remarks-input"
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={t.placeholderRemarks}
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-800 focus:border-brand-gold focus:outline-hidden transition"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-50 mt-5">
            <button
              id="stock-cancel-btn"
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 transition"
            >
              {t.cancelBtn}
            </button>
            <button
              id="stock-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs hover:brightness-95 transition flex items-center gap-1.5 ${
                isStockIn ? "bg-emerald-700" : "bg-red-600"
              }`}
            >
              {isStockIn ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              <span>
                {isSubmitting ? "..." : isStockIn ? t.stockInBtn : t.stockOutBtn}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
