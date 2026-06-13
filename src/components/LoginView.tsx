import React, { useState } from "react";
import { AlertCircle, Lock, Mail, Star } from "lucide-react";
import { Language, translations } from "../types";

interface LoginViewProps {
  onLoginSuccess: (token: string, user: any) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export default function LoginView({ onLoginSuccess, language, setLanguage }: LoginViewProps) {
  const t = translations[language];

  const [email, setEmail] = useState("admin@stokkitani.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login validation failed");
      }

      // Success callback
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || t.invalidCredentials);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-app-bg text-brand-dark animate-fade-in">
      {/* 1. Left Side Column (Decorative Branding Info Screen) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-brand-dark p-12 text-white lg:flex">
        {/* Background Subtle Gradient Glow circles */}
        <div className="absolute inset-0 bg-radial-at-t from-gray-800 via-brand-dark to-brand-dark opacity-90" />
        
        {/* Top brand header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
            <svg
              className="h-7 w-7 text-brand-gold"
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
          <span className="text-2xl font-black tracking-tight">
            Stok<span className="text-brand-gold">Kitani</span>
          </span>
        </div>

        {/* Branding Slogans */}
        <div className="relative z-10 my-auto max-w-md space-y-4">
          <div className="inline-flex items-center gap-1 bg-brand-gold/20 text-brand-gold text-xs font-bold px-3 py-1 rounded-full border border-brand-gold/30">
            <Star className="h-3 w-3 fill-brand-gold" />
            <span>{language === "en" ? "Brunei SME Exclusive" : "Khas untuk PKS Brunei"}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            {t.appName}
          </h1>
          <p className="text-base font-semibold text-gray-300 leading-relaxed">
            {t.loginSubtitle}
          </p>
        </div>

        {/* Footer info containing localized help info */}
        <div className="relative z-10 border-t border-white/10 pt-6">
          <span className="text-xs font-semibold text-gray-400">
            {language === 'en' 
              ? "© 2026 StokKitani. Empowering retail centers and store managers with ease." 
              : "© 2026 StokKitani. Memperkasa pengurusan pusat niaga dan gudang am."}
          </span>
        </div>
      </div>

      {/* 2. Right Side Column (Interactive Credentials Card Form) */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 sm:px-12 xl:px-24">
        {/* Mobile top header branding */}
        <div className="mx-auto w-full max-w-sm lg:hidden mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-dark text-brand-gold shadow-md">
              <svg
                className="h-6 w-6"
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
            <span className="text-xl font-extrabold">
              Stok<span className="text-brand-gold">Kitani</span>
            </span>
          </div>
        </div>

        {/* Main form card container */}
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-brand-dark sm:text-3xl">
              {t.loginTitle}
            </h2>
            
            {/* Bilingual instant toggle link */}
            <button
              onClick={() => setLanguage(language === "en" ? "bm" : "en")}
              className="text-xs font-extrabold text-[#C9A227] hover:underline"
            >
              {language === "en" ? "Bahasa Melayu" : "English"}
            </button>
          </div>
          <p className="mt-2 text-xs font-semibold text-gray-400">
            {language === "en" ? "Please sign in to access inventory dashboard." : "Sila log masuk untuk mengakses papan pemuka inventori."}
          </p>

          {/* Form frame */}
          <form onSubmit={handleLoginSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3.5 text-xs font-bold text-red-700 border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email input field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {t.email}
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@stokkitani.com"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-10 text-xs font-bold text-gray-800 placeholder:text-gray-400 focus:border-brand-gold focus:outline-hidden transition"
                />
              </div>
            </div>

            {/* Password input field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {t.password}
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-10 text-xs font-bold text-gray-800 placeholder:text-gray-400 focus:border-brand-gold focus:outline-hidden transition"
                />
              </div>
            </div>

            {/* Submit Login Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl bg-brand-gold text-sm font-bold text-white shadow-sm hover:brightness-95 disabled:opacity-50 transition duration-150 cursor-pointer"
            >
              {loading ? "..." : t.loginBtn}
            </button>
          </form>

          {/* Test Account Note Widget boxes */}
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-3xs space-y-2">
            <h4 className="text-xs font-extrabold text-amber-800 flex items-center gap-1.5">
              <span>{t.demoAccount}</span>
            </h4>
            <p className="text-[10px] font-semibold text-gray-500">
              {t.demoNote}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-amber-100 text-[10px] font-mono">
              <div className="bg-white/80 p-2 rounded-xl border border-amber-100">
                <span className="text-[9px] font-sans font-bold text-gray-400 block uppercase">Email</span>
                <span className="font-extrabold text-gray-800 select-all">admin@stokkitani.com</span>
              </div>
              <div className="bg-white/80 p-2 rounded-xl border border-amber-100">
                <span className="text-[9px] font-sans font-bold text-gray-400 block uppercase">Password</span>
                <span className="font-extrabold text-gray-800 select-all">password123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
