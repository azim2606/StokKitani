import { AlertTriangle, ArrowDownRight, ArrowUpRight, Banknote, Package, TrendingUp, XCircle } from "lucide-react";
import { DashboardSummary, Language, translations } from "../types";

interface DashboardViewProps {
  summary: DashboardSummary | null;
  language: Language;
  onNavigateToItems: (statusFilter: string) => void;
  onNavigateToMovements: () => void;
}

export default function DashboardView({
  summary,
  language,
  onNavigateToItems,
  onNavigateToMovements,
}: DashboardViewProps) {
  const t = translations[language];

  if (!summary) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
      </div>
    );
  }

  // Format money beautifully in BND (Brunei Dollars)
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: "BND",
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title & Welcome Headers (Mobile only, hidden on desktop layout) */}
      <div className="flex flex-col gap-1.5 md:hidden">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-dark sm:text-3xl">
          {t.navDashboard}
        </h1>
        <p className="text-sm font-medium text-gray-500">
          {language === "en" 
            ? "Real-time summary dashboard of your Brunei business items and stock health." 
            : "Ringkasan maklumat semasa baki barangan dan kesihatan stok perniagaan Brunei anda."}
        </p>
      </div>

      {/* Low Stock Alerts Highlight Banner */}
      {summary.lowStockItems + summary.outOfStockItems > 0 && (
        <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100/80 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                {language === "en" ? "Action Required: Attention Needed" : "Tindakan Serta-merta Diperlukan"}
              </h3>
              <p className="mt-0.5 text-xs font-semibold text-gray-500">
                {language === "en"
                  ? `There are ${summary.outOfStockItems} out-of-stock items and ${summary.lowStockItems} low-stock items requiring active replenishment.`
                  : `Terdapat ${summary.outOfStockItems} barang kehabisan stok dan ${summary.lowStockItems} barang hampir habis yang memerlukan tempahan baru.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToItems("low_stock")}
            className="self-start rounded-xl bg-orange-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:brightness-95 md:self-auto transition"
          >
            {language === "en" ? "Replenish Stock" : "Kemas Kini / Tambah Stok"}
          </button>
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Items / Jumlah Barang */}
        <div
          onClick={() => onNavigateToItems("all")}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:border-brand-gold transition-all duration-150"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">{t.jumlahBarang}</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 text-gray-400 group-hover:bg-[#C9A227]/10 group-hover:text-brand-gold">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-brand-dark">{summary.totalItems}</p>
          <div className="mt-2 text-[11px] font-semibold text-gray-400">
            {language === "en" ? "Items in system catalog" : "Barang berdaftar di katalog"}
          </div>
        </div>

        {/* Low Stock Items / Barang Stok Rendah */}
        <div
          onClick={() => onNavigateToItems("low_stock")}
          className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:border-amber-400 transition-all duration-150"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">{t.barangStokRendah}</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-amber-600">{summary.lowStockItems}</p>
          <div className="mt-2 text-[11px] font-semibold text-gray-400">
            {language === "en" ? "Below minimum thresholds" : "Jumlah di bawah baki kemasukan"}
          </div>
        </div>

        {/* Out of Stock / Kehabisan Stok */}
        <div
          onClick={() => onNavigateToItems("out_of_stock")}
          className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:border-red-400 transition-all duration-150"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">{t.kehabisanStok}</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 group-hover:bg-red-100">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-red-600">{summary.outOfStockItems}</p>
          <div className="mt-2 text-[11px] font-semibold text-gray-400">
            {language === "en" ? "Empty inventory balance" : "Kuantiti baki bernilai sifar"}
          </div>
        </div>

        {/* Total Inventory Value / Jumlah Nilai Inventori */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">{t.jumlahValue}</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C9A227]/15 text-brand-gold">
              <Banknote className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-black tracking-tight text-brand-dark sm:text-3xl">
            {formatCurrency(summary.totalValue)}
          </p>
          <div className="mt-2 text-[11px] font-semibold text-gray-400">
            {language === "en" ? "Reflects: Qty × Selling Price" : "Formula: Kuantiti × Harga Jual"}
          </div>
        </div>
      </div>

      {/* Two-Column Detail Layout: Charts/About & Recent movements */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Brunei Premium SME Promotion Banner */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-dark text-brand-gold">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-lg font-bold text-gray-800">
              {language === "en" ? "StokKitani Platform" : "Sistem StokKitani"}
            </h2>
            <p className="mt-3 text-xs font-semibold leading-relaxed text-gray-500">
              {language === "en"
                ? "Designed exclusively to power small retail shops, stationery storerooms, and business hubs across Brunei Darussalam. Includes dual language translations (Inggeris & Bahasa Melayu) for instant onboarding."
                : "Sistem inventori ringkas yang didedikasikan khas untuk memperkasa usahawan tempatan dan pembekal barangan PKS di Brunei Darussalam. Dilengkapi sokongan dwi dwi-bahasa."}
            </p>
          </div>

          <div className="mt-6 border-t border-gray-50 pt-5">
            <span className="text-[10px] font-extrabold tracking-wider text-brand-gold uppercase">
              {language === "en" ? "Brunei SME Standards" : "Piawaian PKS Negara"}
            </span>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>{language === "en" ? "Complies with BND currency" : "Patuh tetapan mata wang BND"}</span>
            </div>
          </div>
        </div>

        {/* Recent Stock Movements List */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <h2 className="text-base font-bold text-gray-800">{t.recentMovements}</h2>
            <button
              onClick={onNavigateToMovements}
              className="text-xs font-bold text-[#C9A227] hover:underline"
            >
              {language === "en" ? "View All Logs" : "Semak Log Sejarah"}
            </button>
          </div>

          <div className="mt-4 divide-y divide-gray-50">
            {summary.recentMovements.length === 0 ? (
              <p className="py-6 text-center text-xs font-semibold text-gray-400">{t.noRecentMovements}</p>
            ) : (
              summary.recentMovements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    {/* Direction badge */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold shadow-2xs ${
                        movement.type === "stock_in"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-red-50 text-red-700 border border-red-100"
                      }`}
                    >
                      {movement.type === "stock_in" ? (
                        <ArrowUpRight className="h-4.5 w-4.5" />
                      ) : (
                        <ArrowDownRight className="h-4.5 w-4.5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">{movement.itemName}</h4>
                      <p className="text-[10px] font-semibold text-gray-400">
                        {new Date(movement.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-black ${
                        movement.type === "stock_in" ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {movement.type === "stock_in" ? "+" : "-"}
                      {movement.quantity}
                    </span>
                    <p className="max-w-[120px] truncate text-[10px] font-semibold text-gray-400 sm:max-w-[200px]" title={movement.remarks}>
                      {movement.remarks}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
