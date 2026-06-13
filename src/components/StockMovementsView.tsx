import { ArrowDownRight, ArrowUpRight, History, Calendar, RefreshCw } from "lucide-react";
import { Language, StockMovement, translations } from "../types";

interface StockMovementsViewProps {
  movements: StockMovement[];
  language: Language;
}

export default function StockMovementsView({ movements, language }: StockMovementsViewProps) {
  const t = translations[language];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* View Header (Mobile only, hidden on desktop layout) */}
      <div className="flex flex-col gap-1 md:hidden">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-dark sm:text-3xl">
          {t.navMovements}
        </h1>
        <p className="text-xs font-semibold text-gray-400">
          {language === "en" ? "Full audit history log of stock transactions and entry notes." : "Rekod arkib lengkap pendaftaran stok masuk dan keluar bersandarkan catatan audit."}
        </p>
      </div>

      {/* Audit Log Table Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-gray-500">
            <thead className="bg-gray-50/75 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-5 py-4">{t.date}</th>
                <th scope="col" className="px-5 py-4">{t.sku}</th>
                <th scope="col" className="px-5 py-4">{t.itemName}</th>
                <th scope="col" className="px-5 py-4 text-center">{t.type}</th>
                <th scope="col" className="px-5 py-4 text-center">{t.movementQty}</th>
                <th scope="col" className="px-5 py-4">{t.remarks}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center font-semibold text-gray-400 bg-white">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <History className="h-8 w-8 text-gray-300 animate-pulse" />
                      <span>{language === "en" ? "No stock movements recorded yet." : "Tiada pergerakan stok direkodkan lagi."}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                movements.map((mov) => {
                  const isStockIn = mov.type === "stock_in";
                  return (
                    <tr key={mov.id} className="hover:bg-gray-50/60 transition duration-150">
                      {/* Date and Time */}
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>{new Date(mov.createdAt).toLocaleString()}</span>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="whitespace-nowrap px-5 py-4 font-mono font-bold text-[#C9A227]">
                        {mov.itemSku || "—"}
                      </td>

                      {/* Item Name */}
                      <td className="px-5 py-4 font-bold text-gray-800">
                        {mov.itemName}
                      </td>

                      {/* Type Badge */}
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-extrabold ${
                            isStockIn
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-red-50 text-red-700 border border-red-100"
                          }`}
                        >
                          {isStockIn ? (
                            <>
                              <ArrowUpRight className="h-3 w-3" />
                              <span>{t.stockIn}</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="h-3 w-3" />
                              <span>{t.stockOut}</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Quantity Change */}
                      <td className="whitespace-nowrap px-5 py-4 text-center font-black">
                        <span className={isStockIn ? "text-emerald-700" : "text-red-700"}>
                          {isStockIn ? "+" : "-"}
                          {mov.quantity}
                        </span>
                      </td>

                      {/* Remarks */}
                      <td className="px-5 py-4 font-medium text-gray-500 max-w-sm truncate" title={mov.remarks}>
                        {mov.remarks || "—"}
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
