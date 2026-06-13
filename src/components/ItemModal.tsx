import React, { useState, useEffect } from "react";
import { X, Save, AlertTriangle } from "lucide-react";
import { Item, Language, translations } from "../types";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => Promise<boolean>;
  itemToEdit: Item | null;
  language: Language;
}

export default function ItemModal({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
  language,
}: ItemModalProps) {
  const t = translations[language];

  // Form states matching blueprint schema
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Stationery");
  const [quantity, setQuantity] = useState(0);
  const [minimumStock, setMinimumStock] = useState(5);
  const [price, setPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [location, setLocation] = useState("Main Store");

  // Error validations state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setSku(itemToEdit.sku);
      setName(itemToEdit.name);
      setDescription(itemToEdit.description || "");
      setCategory(itemToEdit.category);
      setQuantity(itemToEdit.quantity);
      setMinimumStock(itemToEdit.minimumStock);
      setPrice(itemToEdit.price);
      setCostPrice(itemToEdit.costPrice || 0);
      setLocation(itemToEdit.location || "Main Store");
    } else {
      // Clear data for new entry setup
      setSku("");
      setName("");
      setDescription("");
      setCategory("Stationery");
      setQuantity(0);
      setMinimumStock(5);
      setPrice(0);
      setCostPrice(0);
      setLocation("Main Store");
    }
    setErrors({});
    setGeneralError("");
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const categories = [
    "Stationery",
    "IT Accessories",
    "Office Supplies",
    "Retail Supplies",
    "Printing Supplies",
  ];

  const locations = [
    "Main Store",
    "Front Counter",
    "Office Cabinet",
    "Storage Room A",
  ];

  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!sku.trim()) tempErrors.sku = t.requiredField;
    if (!name.trim()) tempErrors.name = t.requiredField;
    if (!category) tempErrors.category = t.requiredField;
    if (!location) tempErrors.location = t.requiredField;

    // Minimum boundary value checks
    if (quantity < 0) {
      tempErrors.quantity = language === "en" ? "Quantity cannot be less than zero" : "Kuantiti tidak boleh kurang dari sifar";
    }
    if (minimumStock < 0) {
      tempErrors.minimumStock = language === "en" ? "Minimum stock limit cannot be less than zero" : "Stok minimum tidak boleh kurang dari sifar";
    }
    if (price < 0) {
      tempErrors.price = language === "en" ? "Selling price cannot be less than zero" : "Harga jual tidak boleh kurang dari sifar";
    }
    if (costPrice < 0) {
      tempErrors.costPrice = language === "en" ? "Cost price cannot be less than zero" : "Harga kos tidak boleh kurang dari sifar";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setGeneralError("");

    const payload = {
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim(),
      category,
      quantity: Number(quantity),
      minimumStock: Number(minimumStock),
      price: Number(price),
      costPrice: Number(costPrice),
      location,
    };

    try {
      const success = await onSave(payload);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setGeneralError(err.message || "Failed to process database saving action");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
        {/* Header banner */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-6 py-4">
          <h2 className="text-base font-extrabold text-brand-dark">
            {itemToEdit ? t.editItem : t.addItem}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* General Alert */}
          {generalError && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3.5 text-xs font-bold text-red-700 border border-red-100">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Row 1: SKU & Category */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.sku} *</label>
              <input
                id="modal-sku"
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder={t.placeholderSku}
                disabled={!!itemToEdit}
                className={`w-full rounded-xl border p-2.5 text-xs font-semibold focus:border-brand-gold focus:outline-hidden transition ${
                  itemToEdit ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white border-gray-200"
                }`}
              />
              {errors.sku && <span className="mt-1 text-[10px] font-bold text-red-600">{errors.sku}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.category} *</label>
              <select
                id="modal-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-bold text-gray-800 focus:border-brand-gold focus:outline-hidden transition"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Item Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.itemName} *</label>
            <input
              id="modal-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.placeholderName}
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-800 focus:border-brand-gold focus:outline-hidden transition"
            />
            {errors.name && <span className="mt-1 text-[10px] font-bold text-red-600">{errors.name}</span>}
          </div>

          {/* Row 3: Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">{language === "en" ? "Description" : "Keterangan"}</label>
            <textarea
              id="modal-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.placeholderDesc}
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-800 focus:border-brand-gold focus:outline-hidden transition resize-none"
            />
          </div>

          {/* Row 4: Pricing Rates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.price} (BND) *</label>
              <input
                id="modal-price"
                type="number"
                step="0.01"
                min="0"
                value={price || ""}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-800 focus:border-brand-gold focus:outline-hidden transition"
              />
              {errors.price && <span className="mt-1 text-[10px] font-bold text-red-600">{errors.price}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.costPrice} (BND)</label>
              <input
                id="modal-cost-price"
                type="number"
                step="0.01"
                min="0"
                value={costPrice || ""}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-800 focus:border-brand-gold focus:outline-hidden transition"
              />
              {errors.costPrice && <span className="mt-1 text-[10px] font-bold text-red-600">{errors.costPrice}</span>}
            </div>
          </div>

          {/* Row 5: Quantities and Locations */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Show quantity only if not editing (or show disabled if editing) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.quantity}</label>
              <input
                id="modal-qty"
                type="number"
                min="0"
                disabled={!!itemToEdit}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className={`w-full rounded-xl border p-2.5 text-xs font-semibold focus:border-brand-gold focus:outline-hidden transition ${
                  itemToEdit ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white border-gray-200"
                }`}
              />
              {errors.quantity && <span className="mt-1 text-[10px] font-bold text-red-600">{errors.quantity}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.minStock}</label>
              <input
                id="modal-min-stock"
                type="number"
                min="0"
                value={minimumStock}
                onChange={(e) => setMinimumStock(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-800 focus:border-brand-gold focus:outline-hidden transition"
              />
              {errors.minimumStock && <span className="mt-1 text-[10px] font-bold text-red-600">{errors.minimumStock}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.location} *</label>
              <select
                id="modal-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-bold text-gray-800 focus:border-brand-gold focus:outline-hidden transition"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-50 pt-5 mt-6">
            <button
              id="modal-cancel-btn"
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50 transition"
            >
              {t.cancelBtn}
            </button>
            <button
              id="modal-save-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-brand-dark px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:brightness-95 disabled:opacity-50 transition"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? "..." : t.saveBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
