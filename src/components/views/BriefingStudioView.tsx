import React, { useState, useEffect } from "react";
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  CheckCircle2,
  Printer,
  Calendar,
  Layers,
  BookmarkPlus,
  Trash2,
  ExternalLink,
  Info,
  LogIn,
} from "lucide-react";
import { RouteData, IndexTimeSeriesPoint } from "../../types";
import { BriefingStudioSubsection } from "../../types/navigation";
import { VisualStudio } from "../VisualStudio";
import { useAuth } from "../../context/AuthContext";
import { subscribeToUserReports, SavedReportDoc, deleteUserReport } from "../../lib/firebase";

interface BriefingStudioViewProps {
  routes: RouteData[];
  timeSeries: IndexTimeSeriesPoint[];
  currentSubsection: BriefingStudioSubsection;
  onSelectSubsection: (sub: BriefingStudioSubsection) => void;
  onOpenExportModal: () => void;
}

export const BriefingStudioView: React.FC<BriefingStudioViewProps> = ({
  routes,
  timeSeries,
  currentSubsection,
  onSelectSubsection,
  onOpenExportModal,
}) => {
  const { user, signIn } = useAuth();
  const [savedReports, setSavedReports] = useState<SavedReportDoc[]>([]);
  const [copied, setCopied] = useState(false);
  const [briefFormat, setBriefFormat] = useState<"mospi" | "rbi" | "dgca">("mospi");

  useEffect(() => {
    if (!user) {
      setSavedReports([]);
      return;
    }
    const unsubscribe = subscribeToUserReports(user.uid, (docs) => {
      setSavedReports(docs);
    });
    return () => unsubscribe();
  }, [user]);

  const defaultBriefText = `# MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION (MoSPI)
## NATIONAL STATISTICAL OFFICE (NSO) · HIGH-FREQUENCY AIRFARE INTELLIGENCE MEMO
**Reference:** AERONEX-BRIEF-2026-09-SEP | **Classification:** Official Policy Briefing
**Period Under Review:** September 2026 (Live Ingestion Pipeline)

---

### 1. EXECUTIVE SUMMARY & HEADLINE METRICS
- **National Airfare Price Index (AFPI):** **128.4** (Base Year 2024 = 100)
- **Month-on-Month Movement:** **+4.2%** vs August 2026
- **Year-on-Year Escalation:** **+11.7%** vs September 2025
- **CPI Transport Inflation Impulse:** **+22 basis points (+0.22%)** transmitted to Core CPI
- **Primary Cost Drivers:** Aviation Turbine Fuel (ATF) pass-through (52%) and festive holiday demand surges (28%).

---

### 2. SECTORAL SURVEILLANCE & LOCALIZED VOLATILITY
1. **Delhi ➔ Patna (DEL-PAT):** Severe festive surge (+18.6% MoM, peak multiplier 2.45x) ahead of Chhath Puja.
2. **Delhi ➔ Srinagar (DEL-SXR):** Leisure weekend surge (+28.0% weekend premium, median ₹6,950).
3. **Bengaluru ➔ Delhi (BLR-DEL):** Monday executive peak walk-up fare reaching ₹13,900 on T-0 tickets.

---

### 3. POLICY RECOMMENDATION & REGULATORY SURVEILLANCE
- **Rule 135 Audit:** Recommend DGCA examine algorithmic dynamic bands on regional festival corridors where load factors exceed 94%.
- **Price Transparency:** Encourage strict enforcement of Section 5 of Consumer Protection Act regarding hidden OTA convenience fee spreads.

*Generated via AeroNex Real-Time Telemetry Mesh.*`;

  const [briefText, setBriefText] = useState(defaultBriefText);

  const handleCopy = () => {
    navigator.clipboard.writeText(briefText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            Briefing Studio & Visual Dissemination
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          {[
            { id: "generate-brief" as const, label: "Generate Brief" },
            { id: "saved-briefings" as const, label: `Saved Memos (${savedReports.length})` },
            { id: "generate-visual" as const, label: "Generate Visual (AI)" },
            { id: "export" as const, label: "Export Datasets" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "export") {
                  onOpenExportModal();
                } else {
                  onSelectSubsection(tab.id);
                }
              }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                currentSubsection === tab.id
                  ? "bg-cyan-600 text-white font-bold shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: Generate Brief */}
      {currentSubsection === "generate-brief" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                  EXECUTIVE POLICY DISSEMINATION
                </span>
                <span className="text-xs text-slate-400 font-mono">Statistical Intelligence Memo</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Government & Central Bank Airfare Briefing Generator
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Compile live high-frequency national AFPI indices, anomaly alerts, and sectoral yield telemetry into an official executive policy memorandum ready for the RBI MPC or MoSPI NSO.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white transition cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                <span>{copied ? "Copied!" : "Copy Memo"}</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>

          {/* Memo Editor & Preview */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 font-mono text-xs leading-relaxed space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
              <span className="text-xs text-cyan-300 font-bold uppercase">Executive Memorandum Draft</span>
              <span className="text-[10px]">Editable in real-time</span>
            </div>
            <textarea
              value={briefText}
              onChange={(e) => setBriefText(e.target.value)}
              rows={22}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-hidden focus:border-cyan-500 font-mono text-xs leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* VIEW 2: Saved Briefings */}
      {currentSubsection === "saved-briefings" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-white">Archived Policy Briefings & Analyst Notes</h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Retrieve previously generated and saved macroeconomic briefings. Documents are persisted in Google Cloud Firestore and synced with Cloud SQL.
            </p>
          </div>

          {!user ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-800/40">
                <BookmarkPlus className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Authentication Required to View Cloud Briefings</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Sign in with your official Google account to access encrypted Firestore reports and saved policy memoranda.
                </p>
              </div>
              <button
                type="button"
                onClick={() => signIn()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer shadow-md"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Access Cloud Archives</span>
              </button>
            </div>
          ) : savedReports.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <p className="text-sm text-slate-400">No saved briefings found in your account.</p>
              <p className="text-xs text-slate-500">
                Generate an intelligence brief in the "Generate Brief" tab or AI Analyst to save policy reports here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedReports.map((report) => (
                <div key={report.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 uppercase">
                        {report.analysisType}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">{report.title}</h4>
                    </div>
                    {report.id && (
                      <button
                        onClick={() => user && deleteUserReport(user.uid, report.id!)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                        title="Delete Briefing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-4 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    {report.content}
                  </p>
                  <div className="text-[10px] font-mono text-slate-500 flex justify-between pt-1">
                    <span>AeroNex Secure Cloud Vault</span>
                    <button
                      onClick={() => {
                        setBriefText(report.content);
                        onSelectSubsection("generate-brief");
                      }}
                      className="text-cyan-400 hover:underline cursor-pointer"
                    >
                      Load into Editor ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: Generate Visual (AI) */}
      {currentSubsection === "generate-visual" && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono font-bold text-purple-300 uppercase">
                Visual Studio · Briefing Assets
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">Policy Infographics & Chart Image Generation</h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Generate visual artifacts, presentation slides, and econometric diagrams for inclusion in ministerial briefings and press releases.
            </p>
          </div>

          <VisualStudio />
        </div>
      )}

      {/* VIEW 4: Export Datasets */}
      {currentSubsection === "export" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <Download className="w-10 h-10 text-cyan-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Export Ingested Datasets</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Download current quotes, corridor price histories, and national AFPI index points in CSV, JSON, or MoSPI exchange formats.
          </p>
          <button
            type="button"
            onClick={onOpenExportModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Open Export Workbench</span>
          </button>
        </div>
      )}
    </div>
  );
};
