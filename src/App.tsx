import { useState, useEffect, useCallback } from "react";
import { Item, Language, StockMovement, DashboardSummary, translations } from "./types";
import Navbar from "./components/Navbar";
import LoginView from "./components/LoginView";
import DashboardView from "./components/DashboardView";
import ItemsView from "./components/ItemsView";
import StockMovementsView from "./components/StockMovementsView";
import ItemModal from "./components/ItemModal";
import StockActionModal from "./components/StockActionModal";
import { AlertCircle, Plus, FileDown } from "lucide-react";

export default function App() {
  // 1. Language State
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("STOKKITANI_LANG");
    return (saved === "bm" || saved === "en") ? saved : "en";
  });

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("STOKKITANI_LANG", lang);
  };

  // 2. Authentication States
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("STOKKITANI_SESSION_TOKEN");
  });
  
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const savedUser = localStorage.getItem("STOKKITANI_USER");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  // 3. Tab Routing State
  const [currentTab, setCurrentTab] = useState<string>("dashboard");

  // 4. Inventory List & Feed states
  const [items, setItems] = useState<Item[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  // 5. Query Filters States for items catalog
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("");

  // 6. Modals & Action triggers
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedItemToEdit, setSelectedItemToEdit] = useState<Item | null>(null);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedStockType, setSelectedStockType] = useState<"stock_in" | "stock_out" | null>(null);
  const [selectedItemForStock, setSelectedItemForStock] = useState<Item | null>(null);

  // Notifications or errors tracker
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Trigger brief floating success toast message
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Reset errors helper
  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => {
      setErrorMessage(null);
    }, 5000);
  };

  // REST API: Login handler callback
  const handleLoginSuccess = (userToken: string, userData: any) => {
    setToken(userToken);
    setCurrentUser(userData);
    localStorage.setItem("STOKKITANI_SESSION_TOKEN", userToken);
    localStorage.setItem("STOKKITANI_USER", JSON.stringify(userData));
    setCurrentTab("dashboard");
    triggerToast(language === "en" ? "Authenticated successfully! Welcome back." : "Daftar masuk berjaya! Selamat kembali.");
  };

  // REST API: Logout handler
  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
      // Ignore network failures for signouts
    }
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("STOKKITANI_SESSION_TOKEN");
    localStorage.removeItem("STOKKITANI_USER");
    setItems([]);
    setMovements([]);
    setSummary(null);
  }, []);

  // REST API: Dynamic headers helper
  const getAuthHeaders = useCallback(() => {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  }, [token]);

  // REST API: Get dashboard statistics counts
  const fetchDashboardSummary = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/dashboard/summary", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          return;
        }
        throw new Error("Failed to load dashboard statistics summary");
      }
      const data = await response.json();
      setSummary(data);
    } catch (err: any) {
      triggerError(err.message);
    }
  }, [token, getAuthHeaders, handleLogout]);

  // REST API: Fetch all items with filters applied
  const fetchInventoryItems = useCallback(async () => {
    if (!token) return;
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (categoryFilter !== "all") queryParams.append("category", categoryFilter);
      if (statusFilter !== "all") queryParams.append("status", statusFilter);
      if (sortOption) queryParams.append("sort", sortOption);

      const response = await fetch(`/api/items?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Could not load inventory database catalog");
      const data = await response.json();
      setItems(data);
    } catch (err: any) {
      triggerError(err.message);
    }
  }, [token, search, categoryFilter, statusFilter, sortOption, getAuthHeaders]);

  // REST API: Get movement logs feed
  const fetchStockMovements = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/stock-movements", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Could not retrieve stock movement listings");
      const data = await response.json();
      setMovements(data);
    } catch (err: any) {
      triggerError(err.message);
    }
  }, [token, getAuthHeaders]);

  // Automatically fetch contents depending on currently visible tab navigation
  useEffect(() => {
    if (!token) return;
    fetchDashboardSummary();
    fetchInventoryItems();
    fetchStockMovements();
  }, [token, fetchDashboardSummary, fetchInventoryItems, fetchStockMovements, currentTab]);

  // REST API: Save Item (Create or Update transaction handler)
  const handleSaveItem = async (formData: any): Promise<boolean> => {
    try {
      const isEditing = !!selectedItemToEdit;
      const url = isEditing ? `/api/items/${selectedItemToEdit.id}` : "/api/items";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Execution failed during catalog saving operation");
      }

      triggerToast(
        isEditing
          ? (language === "en" ? "Item details updated successfully!" : "Butiran barangan berjaya dikemas kini!")
          : (language === "en" ? "New item registered to catalog!" : "Barang baru didaftarkan ke katalog!")
      );

      // Refresh listings
      fetchInventoryItems();
      fetchDashboardSummary();
      return true;
    } catch (err: any) {
      triggerError(err.message);
      throw err;
    }
  };

  // REST API: Stock Movement increment / decrement registerer
  const handleStockMovementSubmit = async (qty: number, notes: string): Promise<boolean> => {
    if (!selectedItemForStock || !selectedStockType) return false;
    try {
      const url = `/api/items/${selectedItemForStock.id}/${
        selectedStockType === "stock_in" ? "stock-in" : "stock-out"
      }`;

      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity: qty, remarks: notes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to record transaction log to database");
      }

      triggerToast(translations[language].stockSuccess);
      
      // Update state listings
      fetchInventoryItems();
      fetchDashboardSummary();
      fetchStockMovements();
      return true;
    } catch (err: any) {
      triggerError(err.message);
      throw err;
    }
  };

  // REST API: Delete single item
  const handleDeleteItem = async (id: number) => {
    const confirmation = window.confirm(translations[language].confirmDelete);
    if (!confirmation) return;

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete target entry");
      }

      triggerToast(language === 'en' ? "Inventory item deleted successfully." : "Barang berjaya dipadam daripada senarai.");
      
      // Refresh
      fetchInventoryItems();
      fetchDashboardSummary();
    } catch (err: any) {
      triggerError(err.message);
    }
  };

  // REST API: Bulk delete items
  const handleDeleteMultipleItems = async (ids: number[]) => {
    try {
      const response = await fetch(`/api/items/bulk-delete`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ ids }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to bulk delete target entries");
      }

      triggerToast(
        language === 'en'
          ? `Successfully deleted ${ids.length} entries from inventory catalog.`
          : `Berjaya memadam ${ids.length} barang daripada senarai inventori.`
      );

      // Refresh
      fetchInventoryItems();
      fetchDashboardSummary();
    } catch (err: any) {
      triggerError(err.message);
    }
  };

  // Redirection handler to jump from dashboard cards into custom lists
  const handleDashboardNavigateToItems = (status: string) => {
    setStatusFilter(status);
    setCurrentTab("items");
  };

  const handleExportCSV = useCallback(() => {
    if (items.length === 0) {
      triggerToast(language === "en" ? "No filtered items available to export." : "Tiada barang yang ditapis untuk dieksport.");
      return;
    }

    const headers = [
      "SKU",
      language === "en" ? "Item Name" : "Nama Barang",
      language === "en" ? "Description" : "Butiran/Huraian",
      language === "en" ? "Category" : "Kategori",
      language === "en" ? "Current Quantity" : "Kuantiti Semasa",
      language === "en" ? "Minimum Stock Alert" : "Amaran Stok Minimum",
      language === "en" ? "Selling Price (BND)" : "Harga Jual (BND)",
      language === "en" ? "Cost Price (BND)" : "Harga Kos (BND)",
      language === "en" ? "Storage Location" : "Lokasi Simpanan",
      language === "en" ? "Date Created" : "Tarikh Daftar",
    ];

    const escapeCSVField = (val: any) => {
      if (val === null || val === undefined) return "";
      let str = String(val).trim();
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        str = `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = items.map((item) => [
      item.sku,
      item.name,
      item.description || "",
      item.category,
      item.quantity,
      item.minimumStock,
      item.price.toFixed(2),
      item.costPrice.toFixed(2),
      item.location,
      new Date(item.createdAt).toLocaleString(),
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map((row) => row.map(escapeCSVField).join(",")),
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `StokKitani_Inventory_Report_${new Date().toISOString().split("T")[0]}_${language}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    triggerToast(
      language === "en"
        ? `Successfully exported ${items.length} items to CSV!`
        : `Berjaya mengeksport ${items.length} barang ke CSV!`
    );
  }, [items, language]);

  // Modal actions triggers
  const triggerAddModal = () => {
    setSelectedItemToEdit(null);
    setIsItemModalOpen(true);
  };

  const triggerEditModal = (item: Item) => {
    setSelectedItemToEdit(item);
    setIsItemModalOpen(true);
  };

  const triggerStockInModal = (item: Item) => {
    setSelectedItemForStock(item);
    setSelectedStockType("stock_in");
    setIsStockModalOpen(true);
  };

  const triggerStockOutModal = (item: Item) => {
    setSelectedItemForStock(item);
    setSelectedStockType("stock_out");
    setIsStockModalOpen(true);
  };

  // --- RENDERING ROUTER BLOCK ---
  if (!token) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        language={language}
        setLanguage={changeLanguage}
      />
    );
  }

  const t = translations[language];

  return (
    <div className="min-h-screen bg-[#F8F6F1] text-brand-dark flex flex-col md:flex-row font-sans">
      {/* 1. Navbar Navigation Header & Sidebar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={changeLanguage}
        onLogout={handleLogout}
        userName={currentUser?.name || "Administrator"}
        userEmail={currentUser?.email || "admin@stokkitani.com"}
      />

      {/* 2. Main Page Layout Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        
        {/* Elegant Desktop Top Header */}
        <header className="hidden md:flex h-20 bg-white border-b border-gray-200 px-8 items-center justify-between shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl font-extrabold text-[#111827] tracking-tight">
              {currentTab === "dashboard" && (
                <>
                  {t.navDashboard} <span className="text-gray-400 font-normal text-sm">/ Dashboard</span>
                </>
              )}
              {currentTab === "items" && (
                <>
                  {t.navItems} <span className="text-gray-400 font-normal text-sm">/ Inventory Items</span>
                </>
              )}
              {currentTab === "movements" && (
                <>
                  {t.navMovements} <span className="text-gray-400 font-normal text-sm">/ Audit Trail</span>
                </>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick stats brief or language select buttons toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl shadow-xs">
              <button
                onClick={() => changeLanguage("bm")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === "bm"
                    ? "bg-white text-brand-dark shadow-xs font-bold"
                    : "text-gray-500 hover:text-brand-dark font-medium"
                }`}
              >
                Melayu
              </button>
              <button
                onClick={() => changeLanguage("en")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === "en"
                    ? "bg-white text-brand-dark shadow-xs font-bold"
                    : "text-gray-500 hover:text-brand-dark font-medium"
                }`}
              >
                English
              </button>
            </div>

            {currentTab === "items" && (
              <div className="flex items-center gap-2">
                <button
                  id="header-export-csv-btn"
                  onClick={handleExportCSV}
                  className="bg-white text-gray-750 hover:bg-gray-50 border border-gray-250 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title={t.exportCSVHelp}
                >
                  <FileDown className="h-4 w-4 text-[#C9A227] stroke-[2.5]" />
                  <span>{t.exportCSV}</span>
                </button>
                <button
                  id="header-add-item-btn"
                  onClick={triggerAddModal}
                  className="bg-[#C9A227] text-[#111827] hover:brightness-95 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 stroke-[3.5]" />
                  <span>{language === "en" ? "Add Item" : "Tambah Barang"}</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* 3. Main content stream */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full">
          
          {/* Error Notification Toast bar */}
          {errorMessage && (
            <div className="fixed top-24 right-6 z-50 flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-bold text-white shadow-lg animate-bounce">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success floating notification banner */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-brand-dark text-white px-5 py-3 text-xs font-bold shadow-xl border-l-4 border-[#C9A227] flex items-center gap-2 animate-fade-in">
              <div className="h-2 w-2 rounded-full bg-[#C9A227] animate-ping" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Active Tab Router switcher */}
          {currentTab === "dashboard" && (
            <DashboardView
              summary={summary}
              language={language}
              onNavigateToItems={handleDashboardNavigateToItems}
              onNavigateToMovements={() => setCurrentTab("movements")}
            />
          )}

          {currentTab === "items" && (
            <ItemsView
              items={items}
              language={language}
              search={search}
              setSearch={setSearch}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sortOption={sortOption}
              setSortOption={setSortOption}
              onAddItem={triggerAddModal}
              onEditItem={triggerEditModal}
              onDeleteItem={handleDeleteItem}
              onStockIn={triggerStockInModal}
              onStockOut={triggerStockOutModal}
              onExportCSV={handleExportCSV}
              onDeleteMultipleItems={handleDeleteMultipleItems}
            />
          )}

          {currentTab === "movements" && (
            <StockMovementsView
              movements={movements}
              language={language}
            />
          )}
        </main>
      </div>

      {/* 3. Global Action Form Modals */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        itemToEdit={selectedItemToEdit}
        language={language}
      />

      <StockActionModal
        isOpen={isStockModalOpen}
        type={selectedStockType}
        item={selectedItemForStock}
        onClose={() => setIsStockModalOpen(false)}
        onSubmit={handleStockMovementSubmit}
        language={language}
      />
    </div>
  );
}
