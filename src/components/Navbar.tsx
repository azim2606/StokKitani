import { BookOpen, LogOut, Package, RefreshCw, Layers } from "lucide-react";
import { Language, translations } from "../types";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onLogout: () => void;
  userName: string;
  userEmail?: string;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  onLogout,
  userName,
  userEmail = "admin@stokkitani.com",
}: NavbarProps) {
  const t = translations[language];

  return (
    <>
      {/* 1. DESKTOP SIDEBAR (Matches the 'Professional Polish' Design HTML theme) */}
      <aside className="hidden md:flex w-64 bg-[#111827] text-white flex-col h-screen sticky top-0 border-r border-gray-800 shrink-0">
        {/* Logo and Brand Title with Gold Highlight box */}
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-[#C9A227] rounded-lg flex items-center justify-center shadow-lg">
            <svg
              className="h-6 w-6 text-[#111827]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white block">
              Stok<span className="text-[#C9A227]">Kitani</span>
            </span>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest block -mt-0.5">
              {language === "en" ? "Brunei SME System" : "Sistem PKS Brunei"}
            </span>
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: "dashboard", label: t.navDashboard, icon: Layers },
            { id: "items", label: t.navItems, icon: Package },
            { id: "movements", label: t.navMovements, icon: RefreshCw },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-${tab.id}`}
                onClick={() => setCurrentTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-[#C9A227] text-[#111827] shadow-md font-bold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <IconComponent className={`h-5 w-5 ${isActive ? "text-[#111827]" : "text-gray-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Language Quick Toggle in Sidebar for extra utility */}
        <div className="px-4 py-2 border-t border-white/5">
          <button
            id="sidebar-lang-toggle"
            onClick={() => setLanguage(language === "en" ? "bm" : "en")}
            className="w-full flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-xs font-bold text-gray-300 hover:bg-white/10 hover:text-white transition"
            title={t.bilingualToggle}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#C9A227]" />
              <span>{language === "en" ? "Bahasa Melayu" : "English Mode"}</span>
            </span>
            <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded-sm uppercase">{language === "en" ? "BM" : "EN"}</span>
          </button>
        </div>

        {/* Sidebar Logged-in Admin User Profile metadata footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white shadow-inner uppercase border border-gray-600">
              {userName ? userName.charAt(0) : "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <p className="text-xs text-gray-400 truncate">{userEmail}</p>
            </div>
            {/* Quick logout tab link */}
            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10 hover:text-red-400 transition cursor-pointer"
              title={t.navLogout}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE HEADER BAR */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-xs md:hidden shrink-0">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111827] shadow-xs">
              <svg
                className="h-5 w-5 text-[#C9A227]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <span className="text-lg font-black tracking-tight text-[#111827]">
              Stok<span className="text-[#C9A227]">Kitani</span>
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === "en" ? "bm" : "en")}
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-bold text-brand-dark hover:bg-gray-100 transition"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#C9A227]" />
              <span>{language === "en" ? "BM" : "EN"}</span>
            </button>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
              title={t.navLogout}
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab menu drawer overlay */}
        <div className="flex border-t border-gray-100 bg-white">
          {[
            { id: "dashboard", label: t.navDashboard, icon: Layers },
            { id: "items", label: t.navItems, icon: Package },
            { id: "movements", label: t.navMovements, icon: RefreshCw },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 text-[10px] font-bold transition-all ${
                  isActive ? "text-[#C9A227] bg-[#C9A227]/5 font-extrabold" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <IconComponent className="h-4 w-4 mb-0.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>
    </>
  );
}
