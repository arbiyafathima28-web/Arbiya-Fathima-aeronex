import React, { useState } from "react";
import { Plane, Activity, RefreshCw, Sparkles, Download, ShieldCheck, LogIn, LogOut, User as UserIcon, Cloud, CloudOff, Database } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenExport: () => void;
  onSelectTab: (tabId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isRefreshing,
  onOpenExport,
  onSelectTab,
}) => {
  const { user, loading: authLoading, dbConnected, signIn, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Header Stripe */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 font-semibold tracking-wide border border-cyan-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              REAL-TIME APIx
            </span>
            <span className="text-slate-400 hidden sm:inline">
              Real-time Airfare Price Index for CPI Augmentation · High-Frequency Portal Ingestion
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              CPI Transport Augmentation: ACTIVE
            </span>
            <span className="text-slate-400 hidden md:inline">
              Sample Frequency: <strong className="text-slate-200">15s Ingestion</strong>
            </span>
            <span className="text-slate-400 hidden lg:inline">
              Base Year: <strong className="text-slate-200">2024 = 100</strong>
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
              <Cloud className="w-3 h-3 text-cyan-400" />
              <span>Firestore</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40" title="Cloud SQL (PostgreSQL) asia-southeast1">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Cloud SQL: Online</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main AeroNex Brand & Action Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-900/30">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Plane className="w-5 h-5 text-cyan-400 transform -rotate-45" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Aero<span className="text-cyan-400">Nex</span>
              </h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                v2.6 Realtime
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              From Flight Prices to Inflation Intelligence
            </p>
          </div>
        </div>

        {/* Live Index Snapshot Pill */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              National Airfare Index (AFPI)
            </div>
            <div className="flex items-center justify-end gap-1.5 font-mono">
              <span className="text-base font-bold text-white">128.4</span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-1 rounded border border-emerald-800/40">
                +4.2% MoM
              </span>
            </div>
          </div>
          <div className="h-7 w-px bg-slate-800"></div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Nowcast CPI Delta
            </div>
            <div className="flex items-center gap-1 font-mono">
              <span className="text-sm font-semibold text-cyan-300">+22 bps</span>
              <span className="text-[10px] text-slate-500">(12-Day Lead)</span>
            </div>
          </div>
        </div>

        {/* Actions & User Auth */}
        <div className="flex items-center gap-2">
          <button
            id="header-refresh-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition cursor-pointer disabled:opacity-50"
            title="Fetch latest airline scrape updates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : "text-slate-400"}`} />
            <span className="hidden sm:inline">{isRefreshing ? "Harvesting..." : "Live Harvest"}</span>
          </button>

          <button
            id="header-ai-analyst-btn"
            onClick={() => onSelectTab("analyst")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-950/50 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>AI MoSPI Brief</span>
          </button>

          <button
            id="header-export-btn"
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition cursor-pointer"
            title="Export Dataset & Index Series"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Firebase Authentication Button */}
          {authLoading ? (
            <div className="h-8 w-20 rounded-lg bg-slate-800 animate-pulse"></div>
          ) : user ? (
            <div className="relative">
              <button
                id="header-user-profile-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-xs text-slate-200 transition cursor-pointer"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover border border-cyan-400"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-cyan-900/80 text-cyan-300 flex items-center justify-center font-bold text-[10px]">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <span className="max-w-[90px] truncate text-slate-200 font-medium">
                  {user.displayName || user.email?.split("@")[0]}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-white truncate">{user.displayName || "Economist"}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                      <ShieldCheck className="w-3 h-3 text-cyan-400" />
                      <span>MoSPI Research Fellow</span>
                    </div>
                  </div>
                  <button
                    id="header-signout-btn"
                    onClick={() => {
                      setShowProfileMenu(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-300 hover:bg-rose-950/40 transition cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="header-signin-btn"
              onClick={signIn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-800/60 shadow-sm transition cursor-pointer"
              title="Sign in with Google to persist simulations and reports in Firestore"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>Google Sign-In</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Market Route Ticker */}
      <div className="bg-slate-900/70 border-t border-slate-800/80 px-4 py-1 overflow-x-auto whitespace-nowrap scrollbar-none text-[11px] font-mono flex items-center gap-6">
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold shrink-0">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>REAL-TIME SECTOR TICKER:</span>
        </div>
        <div className="flex items-center gap-6 text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-slate-400">DEL-BOM:</span> ₹5,420 <span className="text-emerald-400">+4.8%</span>
          </span>
          <span className="text-slate-700">•</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-slate-400">BLR-DEL:</span> ₹6,890 <span className="text-emerald-400">+6.2%</span>
          </span>
          <span className="text-slate-700">•</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-slate-400">BOM-GOI:</span> ₹3,250 <span className="text-rose-400">-2.4%</span>
          </span>
          <span className="text-slate-700">•</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-slate-400">DEL-CCU:</span> ₹5,890 <span className="text-emerald-400">+5.1%</span>
          </span>
          <span className="text-slate-700">•</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-slate-400">DEL-PAT (Chhath):</span> ₹6,250 <span className="text-amber-400 font-bold">+18.6%</span>
          </span>
          <span className="text-slate-700">•</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-slate-400">DEL-SXR:</span> ₹6,950 <span className="text-emerald-400">+12.4%</span>
          </span>
          <span className="text-slate-700">•</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-slate-400">BLR-HYD:</span> ₹2,840 <span className="text-emerald-400">+1.8%</span>
          </span>
        </div>
      </div>
    </header>
  );
};

