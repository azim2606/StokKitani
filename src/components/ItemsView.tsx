import { useState, useEffect } from "react";
import { Search, Plus, SlidersHorizontal, Trash2, Edit2, ArrowUpRight, ArrowDownRight, Archive, FileDown, Trash } from "lucide-react";
import { Item, Language, translations } from "../types";

interface ItemsViewProps {
  items: Item[];
  language: Language;
  search: string;
  setSearch: (s: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  sortOption: string;
  setSortOption: (s: string) => void;
  onAddItem: () => void;
  onEditItem: (item: Item) => void;
  onDeleteItem: (id: number) => void;
  onStockIn: (item: Item) => void;
  onStockOut: (item: Item) => void;
  onExportCSV?: () => void;
  onDeleteMultipleItems?: (ids: number[]) => void;
}

export default function ItemsView({
  items,
  language,
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  sortOption,
  setSortOption,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onStockIn,
  onStockOut,
  onExportCSV,
  onDeleteMultipleItems,
}: ItemsViewProps) {
  const t = translations[language];

  // Bulk items selection trackers
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Synchronize selection state with items array changes
  useEffect(() => {
    const itemIds = new Set(items.map((i) => i.id));
    setSelectedIds((prev) => prev.filter((id) => itemIds.has(id)));
  }, [items]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === items.length && items.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const handleToggleSelectItem = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0 || !onDeleteMultipleItems) return;
    const confirmMessage = t.bulkDeleteConfirm.replace("{count}", String(selectedIds.length));
    if (window.confirm(confirmMessage)) {
      onDeleteMultipleItems(selectedIds);
      setSelectedIds([]);
    }
  };

  // Pre-defined Categories from 18. Demo Data
  const categories = [
    "Stationery",
    "IT Accessories",
    "Office Supplies",
    "Retail Supplies",
    "Printing Supplies",
  ];

  // Format currency in BND
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: "BND",
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Add Action (Mobile only, hidden on desktop layout) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:hidden">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-dark sm:text-3xl">
            {t.itemsList}
          </h1>
          <p className="text-xs font-semibold text-gray-400">
            {language === "en" ? "Review stock volumes, edit details, and record quick movements." : "Pantau kuantiti baki barangan, kemas kini perincian, dan daftar pergerakan pantas."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {onExportCSV && (
            <button
              id="btn-export-csv-mobile"
              onClick={onExportCSV}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-xs hover:bg-gray-50 transition cursor-pointer"
              title={t.exportCSVHelp}
            >
              <FileDown className="h-4 w-4 text-[#C9A227] stroke-[2.5]" />
              <span>{t.exportCSV}</span>
            </button>
          )}
          <button
            id="btn-add-item"
            onClick={onAddItem}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 py-3 text-sm font-bold text-white shadow-xs hover:brightness-95 transition duration-150 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{t.addItem}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Layout Grid */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Main Search */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pr-4 pl-10 text-xs font-semibold placeholder:text-gray-400 focus:border-brand-gold focus:bg-white focus:outline-hidden transition"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-bold text-gray-700 focus:border-brand-gold focus:outline-hidden transition"
            >
              <option value="all">{t.allCategories}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selection Selector */}
          <div className="w-full md:w-44">
            <select
              id="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-bold text-gray-700 focus:border-brand-gold focus:outline-hidden transition"
            >
              <option value="">{t.sortLabel}</option>
              <option value="name">{language === "en" ? "Name / Nama" : "Nama"}</option>
              <option value="sku">SKU</option>
              <option value="quantity">{language === "en" ? "Quantity / Kuantiti" : "Kuantiti"}</option>
              <option value="price">{language === "en" ? "Price / Harga" : "Harga Jual"}</option>
            </select>
          </div>

          {/* Export to CSV Action button (filters row integration) */}
          {onExportCSV && (
            <button
              id="btn-export-csv-filters"
              onClick={onExportCSV}
              className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-[#111827] shadow-xs transition cursor-pointer whitespace-nowrap"
              title={t.exportCSVHelp}
            >
              <FileDown className="h-4 w-4 text-[#C9A227] stroke-[2.5]" />
              <span>{t.exportCSV}</span>
            </button>
          )}
        </div>

        {/* Filter Quick Status tabs (All, In Stock, Low Stock, Empty Stock) */}
        <div className="flex flex-wrap gap-2 border-t border-gray-50 pt-3">
          {[
            { id: "all", label: t.statusAll },
            { id: "in_stock", label: t.statusInStock },
            { id: "low_stock", label: t.statusLowStock },
            { id: "out_of_stock", label: t.statusOutOfStock },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                id={`status-tab-${tab.id}`}
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                  isActive
                    ? "bg-brand-dark text-white"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk action sticky header status ribbon */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-amber-50/85 border border-[#C9A227]/30 p-4 animate-fade-in shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C9A227] text-white text-[10px] font-black">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-gray-800">
              {t.selectedItems.replace("{count}", String(selectedIds.length))}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 rounded-lg bg-red-650 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition cursor-pointer"
            >
              <Trash className="h-3.5 w-3.5" />
              <span>{t.bulkDelete.replace("{count}", String(selectedIds.length))}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Inventory Items Table Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-gray-500">
            <thead className="bg-gray-50/75 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-4 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded-xs border-gray-300 text-[#C9A227] focus:ring-[#C9A227] cursor-pointer"
                    checked={items.length > 0 && selectedIds.length === items.length}
                    onChange={handleToggleSelectAll}
                  />
                </th>
                <th scope="col" className="px-5 py-4">{t.sku}</th>
                <th scope="col" className="px-5 py-4">{t.itemName}</th>
                <th scope="col" className="px-5 py-4">{t.category}</th>
                <th scope="col" className="px-5 py-4 text-center">{t.quantity}</th>
                <th scope="col" className="px-5 py-4 text-center">{t.status}</th>
                <th scope="col" className="px-5 py-4 text-right">{t.price}</th>
                <th scope="col" className="px-5 py-4">{t.location}</th>
                <th scope="col" className="px-5 py-4 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center font-semibold text-gray-400 bg-white">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Archive className="h-8 w-8 text-gray-300" />
                      <span>{language === "en" ? "No matching items found in catalog." : "Tiada barang inventori berkaitan ditemui."}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  // Determine status styling
                  let statusText = t.statusInStock;
                  let statusClass = "bg-green-50 text-green-700 border border-green-100";
                  
                  if (item.quantity === 0) {
                    statusText = t.statusOutOfStock;
                    statusClass = "bg-red-50 text-red-700 border border-red-100";
                  } else if (item.quantity <= item.minimumStock) {
                    statusText = t.statusLowStock;
                    statusClass = "bg-orange-50 text-orange-700 border border-orange-100";
                  }

                  // Calculate Stock Health metrics relative to its minimum threshold
                  const getStockHealth = (qty: number, min: number) => {
                    if (qty === 0) {
                      return {
                        percentage: 0,
                        rawPercentage: 0,
                        colorClass: "bg-red-500",
                        textColorClass: "text-red-600",
                        text: language === "en" ? "Empty" : "Habis",
                      };
                    }
                    if (min === 0) {
                      return {
                        percentage: 100,
                        rawPercentage: 100,
                        colorClass: "bg-emerald-600",
                        textColorClass: "text-emerald-600",
                        text: language === "en" ? "Abundant" : "Cukup",
                      };
                    }
                    const ratio = qty / min;
                    const rawPercentage = Math.round(ratio * 100);
                    const percentage = Math.min(rawPercentage, 100);
                    
                    let colorClass = "bg-emerald-600";
                    let textColorClass = "text-emerald-700";
                    let text = language === "en" ? `${rawPercentage}% Safe` : `${rawPercentage}% Selamat`;

                    if (ratio <= 0.5) {
                      colorClass = "bg-red-500";
                      textColorClass = "text-red-700";
                      text = language === "en" ? `${rawPercentage}% Critical` : `${rawPercentage}% Kritikal`;
                    } else if (ratio <= 1.0) {
                      colorClass = "bg-orange-500";
                      textColorClass = "text-orange-700";
                      text = language === "en" ? `${rawPercentage}% Low` : `${rawPercentage}% Rendah`;
                    } else if (ratio <= 1.5) {
                      colorClass = "bg-amber-500";
                      textColorClass = "text-amber-700";
                      text = language === "en" ? `${rawPercentage}% Moderate` : `${rawPercentage}% Sederhana`;
                    }
                    
                    return { percentage, rawPercentage, colorClass, textColorClass, text };
                  };

                  const health = getStockHealth(item.quantity, item.minimumStock);

                  return (
                    <tr key={item.id} className={`hover:bg-gray-50/70 transition duration-150 ${isSelected ? "bg-amber-50/20" : ""}`}>
                      {/* Selection checkbox cell */}
                      <td className="px-4 py-4 text-center w-12">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded-xs border-gray-300 text-[#C9A227] focus:ring-[#C9A227] cursor-pointer"
                          checked={isSelected}
                          onChange={() => handleToggleSelectItem(item.id)}
                        />
                      </td>

                      {/* SKU code inline label */}
                      <td className="whitespace-nowrap px-5 py-4 font-mono font-bold text-[#C9A227]">
                        {item.sku}
                      </td>
 
                      {/* Name & Description Block */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-800">{item.name}</div>
                        <div className="max-w-xs truncate text-[10px] font-medium text-gray-400" title={item.description}>
                          {item.description || "—"}
                        </div>
                      </td>
 
                      {/* Category Type */}
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-500">
                        {item.category}
                      </td>
 
                      {/* Stock Quantity Count with dynamic stock health progress bar */}
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <div className="flex items-center gap-1">
                            <span className="font-extrabold text-gray-800 text-sm">{item.quantity}</span>
                            <span className="text-[10px] text-gray-400 font-semibold" title={t.minStock}>
                              / {item.minimumStock} min
                            </span>
                          </div>
                          {/* Health bar visual meter */}
                          <div 
                            className="mt-1.5 w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden relative" 
                            title={`${health.rawPercentage}% ${language === 'en' ? 'of minimum threshold' : 'daripada baki minimum'}`}
                          >
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${health.colorClass}`}
                              style={{ width: `${health.percentage}%` }}
                            />
                          </div>
                          {/* Raw calculated text indicator */}
                          <span className={`text-[10px] font-extrabold mt-1 uppercase tracking-wide ${health.textColorClass}`}>
                            {health.text}
                          </span>
                        </div>
                      </td>

                      {/* Dynamic Status Badging */}
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        <span className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-extrabold ${statusClass}`}>
                          {statusText}
                        </span>
                      </td>

                      {/* Price Details */}
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <div className="font-extrabold text-gray-800">{formatCurrency(item.price)}</div>
                        <div className="text-[9px] font-semibold text-gray-400">
                          {t.costPrice}: {formatCurrency(item.costPrice)}
                        </div>
                      </td>

                      {/* Storage Location */}
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-600">
                        {item.location}
                      </td>

                      {/* Row Actions Triggers */}
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Stock In */}
                          <button
                            onClick={() => onStockIn(item)}
                            className="flex h-7 px-2 items-center gap-1 rounded-md bg-emerald-50 text-[10px] font-extrabold text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition"
                            title={t.stockIn}
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            <span>{language === 'en' ? 'In' : 'Masuk'}</span>
                          </button>

                          {/* Stock Out */}
                          <button
                            onClick={() => onStockOut(item)}
                            className="flex h-7 px-2 items-center gap-1 rounded-md bg-red-50 text-[10px] font-extrabold text-red-700 border border-red-100 hover:bg-red-100 transition"
                            title={t.stockOut}
                            disabled={item.quantity === 0}
                          >
                            <ArrowDownRight className="h-3.5 w-3.5" />
                            <span>{language === 'en' ? 'Out' : 'Keluar'}</span>
                          </button>

                          <div className="mx-1 h-5 w-px bg-gray-200" />

                          {/* Edit Item details */}
                          <button
                            onClick={() => onEditItem(item)}
                            className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                            title={t.editItem}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Item item */}
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                            title={t.deleteItem}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
