import React, { useState } from "react";
import { X, Download, FileSpreadsheet, FileCode, FileText, Check } from "lucide-react";
import { RouteData, IndexTimeSeriesPoint } from "../types";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes: RouteData[];
  timeSeries: IndexTimeSeriesPoint[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  routes,
  timeSeries,
}) => {
  const [format, setFormat] = useState<"csv" | "json" | "bulletin">("csv");
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    let content = "";
    let filename = "";
    let mimeType = "";

    if (format === "csv") {
      filename = "aeronex_airfare_index_series.csv";
      mimeType = "text/csv;charset=utf-8;";
      const headers = "Date,Laspeyres_AFPI,Fisher_AFPI,Paasche_AFPI,Jevons_AFPI,MoSPI_Official_Transport_CPI,Nowcast_CPI,ATF_Price_Per_kL\n";
      const rows = timeSeries
        .map(
          (pt) =>
            `${pt.date},${pt.laspeyres},${pt.fisher},${pt.paasche},${pt.jevons},${pt.cpiTransportOfficial},${pt.nowcastAugmentedCpi},${pt.atfPricePerKl}`
        )
        .join("\n");
      content = headers + rows;
    } else if (format === "json") {
      filename = "aeronex_dataset.json";
      mimeType = "application/json;charset=utf-8;";
      content = JSON.stringify({ metadata: { project: "AeroNex Airfare Price Index (APIx)", baseYear: 2024 }, timeSeries, routes }, null, 2);
    } else {
      filename = "aeronex_mospi_official_bulletin.txt";
      mimeType = "text/plain;charset=utf-8;";
      content = `===============================================================
AERONEX REAL-TIME AIRFARE PRICE INDEX (AFPI) FOR CPI AUGMENTATION
MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION (MoSPI) · NSO
===============================================================
Date of Generation: ${new Date().toISOString()}
Base Year: 2024 = 100
National Airfare Price Index (Laspeyres): ${timeSeries[timeSeries.length - 1].laspeyres.toFixed(1)}
National Airfare Price Index (Fisher Ideal): ${timeSeries[timeSeries.length - 1].fisher.toFixed(1)}
Leading Nowcast Headline CPI Impact: +22 bps ahead of official monthly bulletin

Top High-Density Corridors Sampled:
${routes.map((r) => `- ${r.origin} to ${r.destination}: ₹${r.currentMedianPrice} (${r.category}, DGCA Wt: ${(r.dgcaWeight * 100).toFixed(1)}%)`).join("\n")}
===============================================================`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export AeroNex Dataset</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Select export format for MoSPI econometric validation, research reproduction, or algorithmic modeling.
        </p>

        <div className="space-y-2">
          <button
            onClick={() => setFormat("csv")}
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition cursor-pointer ${
              format === "csv"
                ? "bg-cyan-950/80 border-cyan-500 text-white"
                : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-xs font-bold">CSV Time Series Matrix</div>
                <div className="text-[10px] text-slate-400">Laspeyres, Fisher, Paasche, ATF Fuel & CPI</div>
              </div>
            </div>
            {format === "csv" && <Check className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={() => setFormat("json")}
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition cursor-pointer ${
              format === "json"
                ? "bg-cyan-950/80 border-cyan-500 text-white"
                : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileCode className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-xs font-bold">Raw JSON Bundle</div>
                <div className="text-[10px] text-slate-400">Complete route advance curves & metadata</div>
              </div>
            </div>
            {format === "json" && <Check className="w-4 h-4 text-indigo-400" />}
          </button>

          <button
            onClick={() => setFormat("bulletin")}
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition cursor-pointer ${
              format === "bulletin"
                ? "bg-cyan-950/80 border-cyan-500 text-white"
                : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs font-bold">MoSPI Official Executive Bulletin</div>
                <div className="text-[10px] text-slate-400">Formatted text memo for policy presentation</div>
              </div>
            </div>
            {format === "bulletin" && <Check className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-950/50 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloaded ? "Downloaded!" : "Download File"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
