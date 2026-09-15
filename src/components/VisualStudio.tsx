import React, { useState } from "react";
import {
  Image as ImageIcon,
  Sparkles,
  Wand2,
  Download,
  RefreshCw,
  Sliders,
  Layers,
  FileImage,
  Copy,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Info,
} from "lucide-react";

export const VisualStudio: React.FC = () => {
  const [prompt, setPrompt] = useState(
    "High-tech executive infographic for Ministry of Statistics showing India domestic airfare price index surge vs crude oil, dark aesthetic with cyan and crimson neon accents"
  );
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageHistory, setImageHistory] = useState<Array<{ url: string; prompt: string; type: "generated" | "edited"; timestamp: string }>>([]);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Preset prompts tailored to MoSPI & National Airfare Telemetry
  const presets = [
    {
      title: "MoSPI AFPI vs CPI Headline",
      prompt:
        "Official econometric briefing infographic showing the Indian National Airfare Price Index (AFPI) climbing to 128.4 alongside the MoSPI CPI Transport & Communication curve. Polished presentation style with crisp typography and data nodes.",
      ratio: "16:9",
    },
    {
      title: "Festive Gouging Corridor Map",
      prompt:
        "Futuristic 3D map of India highlighting high-traffic aviation trunk routes (DEL-BOM, BLR-DEL, DEL-PAT) with glowing heatmaps illustrating festival algorithmic surge pricing multipliers exceeding 2.5x.",
      ratio: "16:9",
    },
    {
      title: "ATF Jet Fuel Pass-Through Elasticity",
      prompt:
        "Detailed financial visualization comparing Aviation Turbine Fuel (ATF) price per kilolitre against domestic airline base fares and seat kilometre costs (CASK) in India.",
      ratio: "4:3",
    },
    {
      title: "Executive Report Seal & Badge",
      prompt:
        "Emblem and seal badge for AeroNex Real-time Airfare Telemetry System, National Airfare Price Index, gold and cyan geometric wings motif on midnight blue background.",
      ratio: "1:1",
    },
  ];

  const handleGenerate = async (customPrompt?: string, customRatio?: string) => {
    const textToRun = customPrompt || prompt;
    const ratioToRun = customRatio || aspectRatio;
    if (!textToRun.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch("/api/gemini/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToRun, aspectRatio: ratioToRun }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setCurrentImage(data.imageUrl);
        setImageHistory((prev) => [
          {
            url: data.imageUrl,
            prompt: textToRun,
            type: "generated",
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.log("[AeroNex VisualStudio] Image generation notice:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!currentImage || !editPrompt.trim()) return;
    setIsEditing(true);

    try {
      const res = await fetch("/api/gemini/edit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: editPrompt,
          imageBase64: currentImage,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setCurrentImage(data.imageUrl);
        setImageHistory((prev) => [
          {
            url: data.imageUrl,
            prompt: `Edit: ${editPrompt}`,
            type: "edited",
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
        setEditPrompt("");
      }
    } catch (err) {
      console.log("[AeroNex VisualStudio] Image edit notice:", err);
    } finally {
      setIsEditing(false);
    }
  };

  const downloadImage = () => {
    if (!currentImage) return;
    const link = document.createElement("a");
    link.href = currentImage;
    link.download = `aeronex-visual-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800/40">
                GEMINI 3.1 FLASH IMAGE PREVIEW
              </span>
              <span className="text-xs text-slate-400">Visual Briefing & Infographic Engine</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Econometric Infographic & Presentation Studio
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Create and iteratively edit high-resolution econometric figures, aviation network diagrams, and parliamentary briefing visuals directly using natural language text prompts.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPrompt(preset.prompt);
              setAspectRatio(preset.ratio);
              handleGenerate(preset.prompt, preset.ratio);
            }}
            className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-fuchsia-500/50 hover:bg-slate-800/50 text-left transition cursor-pointer space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-fuchsia-400 text-xs font-bold">
              <span>{preset.title}</span>
              <span className="text-[10px] font-mono text-slate-500">{preset.ratio}</span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              {preset.prompt}
            </p>
          </button>
        ))}
      </div>

      {/* Workspace Grid: Controls on Left, Canvas Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Generation Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* Prompt Creator Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
                <span>Text-to-Image Prompt</span>
              </label>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                {["16:9", "1:1", "4:3"].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2 py-0.5 rounded cursor-pointer transition ${
                      aspectRatio === ratio
                        ? "bg-fuchsia-600 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Describe the econometric diagram, route topology chart, or official briefing visual you want to create..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500 leading-relaxed font-sans"
            />

            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 hover:from-fuchsia-500 hover:to-rose-500 transition shadow-lg shadow-fuchsia-950/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating with gemini-3.1-flash-image-preview...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Infographic Visual</span>
                </>
              )}
            </button>
          </div>

          {/* Edit Current Image Box */}
          {currentImage && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Edit This Visual (gemini-3.1-flash-image-preview)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Apply iterative modifications to the current image using natural language.
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="e.g. Add a glowing red alert on DEL-BOM, or add MoSPI seal..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleEdit}
                  disabled={isEditing || !editPrompt.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
                >
                  {isEditing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Editing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Apply Edit</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick edit chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "Add Ministry of Statistics seal in corner",
                  "Make aesthetic darker with glowing neon cyan lines",
                  "Highlight trunk corridor surge spikes in crimson",
                  "Add text banner 'Real-time APIx Nowcasting'",
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setEditPrompt(chip)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* History reel */}
          {imageHistory.length > 1 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
              <span className="text-xs font-bold text-slate-300">Session Iteration History</span>
              <div className="grid grid-cols-4 gap-2">
                {imageHistory.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(item.url)}
                    className={`rounded-lg overflow-hidden border transition cursor-pointer aspect-video relative group ${
                      currentImage === item.url ? "border-fuchsia-500 ring-2 ring-fuchsia-500/30" : "border-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.prompt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white p-0.5 text-center truncate">
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Display Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col min-h-[480px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4 text-fuchsia-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Visual Canvas Output
                </h3>
              </div>

              {currentImage && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadImage}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>
                </div>
              )}
            </div>

            {/* Display Area */}
            <div className="flex-1 flex items-center justify-center rounded-xl bg-slate-950/80 border border-slate-800/80 overflow-hidden relative p-2 min-h-[380px]">
              {isGenerating || isEditing ? (
                <div className="flex flex-col items-center justify-center space-y-3 p-8 text-center">
                  <div className="w-10 h-10 border-3 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-mono text-slate-300">
                    {isGenerating
                      ? "Synthesizing econometric infographic with gemini-3.1-flash-image-preview..."
                      : "Applying image modifications to layer..."}
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-sm">
                    Rendering vector geometries, high-contrast color palettes, and structured statistical nodes.
                  </p>
                </div>
              ) : currentImage ? (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={currentImage}
                    alt={prompt}
                    referrerPolicy="no-referrer"
                    className="max-h-[500px] w-auto max-w-full object-contain rounded-lg shadow-2xl"
                  />
                </div>
              ) : (
                <div className="text-center p-8 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-fuchsia-950/40 border border-fuchsia-800/40 flex items-center justify-center mx-auto text-fuchsia-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">No Visual Generated Yet</h4>
                    <p className="text-xs text-slate-400 max-w-md">
                      Select a preset above or type a custom prompt on the left to generate infographic figures for MoSPI, RBI MPC, or national inflation briefings.
                    </p>
                  </div>
                  <button
                    onClick={() => handleGenerate()}
                    className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-fuchsia-600 hover:bg-fuchsia-500 text-white cursor-pointer transition inline-flex items-center gap-2"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Generate Sample Infographic</span>
                  </button>
                </div>
              )}
            </div>

            {/* Prompt description footer */}
            {currentImage && (
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-lg font-mono">
                  Prompt: {prompt}
                </span>
                <span className="text-fuchsia-400 font-semibold font-mono">
                  Ratio: {aspectRatio}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
