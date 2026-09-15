// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useMemo } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import {
  Plane,
  Layers,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Building2,
  ExternalLink,
  Sparkles,
  Info,
  ShieldAlert,
  Key,
} from "lucide-react";
import { RouteData } from "../types";

export interface AirportGeoHub {
  code: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  type: "major" | "secondary" | "regional";
  dailyFlights: number;
  paxMillions: number;
  terminals: number;
}

export const isValidGoogleMapsApiKey = (key?: string | null): boolean => {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  return /^AIza[0-9A-Za-z-_]{30,50}$/.test(trimmed);
};

export const AIRPORT_COORDINATES: Record<string, AirportGeoHub> = {
  DEL: {
    code: "DEL",
    name: "Indira Gandhi International Airport",
    city: "New Delhi",
    state: "Delhi NCR",
    lat: 28.5562,
    lng: 77.1000,
    type: "major",
    dailyFlights: 1450,
    paxMillions: 73.6,
    terminals: 3,
  },
  BOM: {
    code: "BOM",
    name: "Chhatrapati Shivaji Maharaj International",
    city: "Mumbai",
    state: "Maharashtra",
    lat: 19.0896,
    lng: 72.8656,
    type: "major",
    dailyFlights: 1020,
    paxMillions: 51.5,
    terminals: 2,
  },
  BLR: {
    code: "BLR",
    name: "Kempegowda International Airport",
    city: "Bengaluru",
    state: "Karnataka",
    lat: 13.1986,
    lng: 77.7066,
    type: "major",
    dailyFlights: 810,
    paxMillions: 37.5,
    terminals: 2,
  },
  CCU: {
    code: "CCU",
    name: "Netaji Subhash Chandra Bose International",
    city: "Kolkata",
    state: "West Bengal",
    lat: 22.6547,
    lng: 88.4467,
    type: "major",
    dailyFlights: 540,
    paxMillions: 19.8,
    terminals: 2,
  },
  HYD: {
    code: "HYD",
    name: "Rajiv Gandhi International Airport",
    city: "Hyderabad",
    state: "Telangana",
    lat: 17.2403,
    lng: 78.4294,
    type: "major",
    dailyFlights: 580,
    paxMillions: 25.0,
    terminals: 1,
  },
  MAA: {
    code: "MAA",
    name: "Chennai International Airport",
    city: "Chennai",
    state: "Tamil Nadu",
    lat: 12.9941,
    lng: 80.1709,
    type: "major",
    dailyFlights: 520,
    paxMillions: 21.2,
    terminals: 4,
  },
  GOI: {
    code: "GOI",
    name: "Dabolim / Manohar International Airport",
    city: "Goa",
    state: "Goa",
    lat: 15.3808,
    lng: 73.8314,
    type: "secondary",
    dailyFlights: 220,
    paxMillions: 9.4,
    terminals: 2,
  },
  PAT: {
    code: "PAT",
    name: "Jay Prakash Narayan International",
    city: "Patna",
    state: "Bihar",
    lat: 25.5913,
    lng: 85.0880,
    type: "secondary",
    dailyFlights: 110,
    paxMillions: 4.8,
    terminals: 1,
  },
  GAU: {
    code: "GAU",
    name: "Lokpriya Gopinath Bordoloi International",
    city: "Guwahati",
    state: "Assam",
    lat: 26.1061,
    lng: 91.5859,
    type: "secondary",
    dailyFlights: 160,
    paxMillions: 6.2,
    terminals: 1,
  },
  AMD: {
    code: "AMD",
    name: "Sardar Vallabhbhai Patel International",
    city: "Ahmedabad",
    state: "Gujarat",
    lat: 23.0772,
    lng: 72.6347,
    type: "secondary",
    dailyFlights: 310,
    paxMillions: 11.5,
    terminals: 2,
  },
  COK: {
    code: "COK",
    name: "Cochin International Airport",
    city: "Kochi",
    state: "Kerala",
    lat: 10.1518,
    lng: 76.3930,
    type: "secondary",
    dailyFlights: 240,
    paxMillions: 10.3,
    terminals: 3,
  },
  JAI: {
    code: "JAI",
    name: "Jaipur International Airport",
    city: "Jaipur",
    state: "Rajasthan",
    lat: 26.8242,
    lng: 75.8122,
    type: "regional",
    dailyFlights: 140,
    paxMillions: 5.4,
    terminals: 2,
  },
  IXL: {
    code: "IXL",
    name: "Kushok Bakula Rimpochee Airport",
    city: "Leh",
    state: "Ladakh",
    lat: 34.1359,
    lng: 77.5465,
    type: "regional",
    dailyFlights: 45,
    paxMillions: 1.2,
    terminals: 1,
  },
};

interface FlightCorridorsPolylineOverlayProps {
  routes: RouteData[];
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
}

// Sub-component to draw Geodesic Polylines for flight corridors
const FlightCorridorsPolylineOverlay: React.FC<FlightCorridorsPolylineOverlayProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
}) => {
  const map = useMap("aeronex-google-map");

  useEffect(() => {
    if (!map || !(window as any).google?.maps) return;

    const polylines: google.maps.Polyline[] = [];

    routes.forEach((route) => {
      const orig = AIRPORT_COORDINATES[route.origin];
      const dest = AIRPORT_COORDINATES[route.destination];
      if (!orig || !dest) return;

      const isSelected = route.id === selectedRouteId;
      let strokeColor = "#10b981"; // Stable (Emerald)
      if (route.momChange >= 10) strokeColor = "#f43f5e"; // Severe surge (Crimson)
      else if (route.momChange >= 5) strokeColor = "#f59e0b"; // High surge (Amber)
      else if (route.momChange >= 2) strokeColor = "#06b6d4"; // Moderate growth (Cyan)

      if (isSelected) {
        strokeColor = "#38bdf8";
      }

      const polyline = new google.maps.Polyline({
        path: [
          { lat: orig.lat, lng: orig.lng },
          { lat: dest.lat, lng: dest.lng },
        ],
        geodesic: true,
        strokeColor,
        strokeOpacity: isSelected ? 0.95 : 0.65,
        strokeWeight: isSelected ? 4.5 : Math.max(2, route.dgcaWeight * 25),
        map,
        zIndex: isSelected ? 999 : 10,
      });

      polyline.addListener("click", () => {
        onSelectRoute(route.id);
      });

      polylines.push(polyline);
    });

    return () => {
      polylines.forEach((p) => p.setMap(null));
    };
  }, [map, routes, selectedRouteId, onSelectRoute]);

  return null;
};

interface GoogleAirportsMapProps {
  routes: RouteData[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
  onFallbackToSchematic?: () => void;
}

export const GoogleAirportsMap: React.FC<GoogleAirportsMapProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  onFallbackToSchematic,
}) => {
  const [selectedAirport, setSelectedAirport] = useState<AirportGeoHub | null>(null);
  const [mapType, setMapType] = useState<"roadmap" | "satellite" | "hybrid" | "terrain">("hybrid");
  const [authFailed, setAuthFailed] = useState(false);

  // Only check explicit environment variable for Google Maps Platform
  const rawApiKey = ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || "").trim();
  const isValidFormat = isValidGoogleMapsApiKey(rawApiKey);

  useEffect(() => {
    // Intercept Google Maps authorization failure (ApiTargetBlockedMapError, InvalidKeyMapError)
    const prevAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      console.warn(
        "[GoogleAirportsMap] Google Maps authorization error caught. Switching to safe fallback display."
      );
      setAuthFailed(true);
      if (typeof prevAuthFailure === "function") {
        try {
          prevAuthFailure();
        } catch {
          // ignore cascade error
        }
      }
    };

    const handleScriptError = (event: ErrorEvent) => {
      if (
        event.filename &&
        (event.filename.includes("maps.googleapis.com") ||
          event.filename.includes("maps.gstatic.com"))
      ) {
        console.warn("[GoogleAirportsMap] Caught Google Maps script error:", event.message);
        setAuthFailed(true);
        event.preventDefault();
      }
    };
    window.addEventListener("error", handleScriptError);

    return () => {
      (window as any).gm_authFailure = prevAuthFailure;
      window.removeEventListener("error", handleScriptError);
    };
  }, []);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  const selectedRouteAirports = useMemo(() => {
    return {
      origin: AIRPORT_COORDINATES[selectedRoute?.origin],
      dest: AIRPORT_COORDINATES[selectedRoute?.destination],
    };
  }, [selectedRoute]);

  const isMapDisabled = !isValidFormat || authFailed;

  // Determine user guidance based on key status
  const keyErrorNotice = useMemo(() => {
    if (!rawApiKey) {
      return {
        title: "Google Maps API Key Not Configured",
        desc: "To view live Google Maps satellite and terrain tiles, define VITE_GOOGLE_MAPS_API_KEY in Settings. You can also use the high-performance Radar Vector map without any API key.",
      };
    }
    if (!isValidFormat) {
      return {
        title: "Invalid Google Maps API Key Format",
        desc: "The configured key is not a valid Google Cloud Platform key. Google Maps API keys must start with 'AIzaSy...' (39 characters). Please check your key in Google Cloud Console or continue using the Radar Vector map.",
      };
    }
    return {
      title: "Google Maps Authorization Blocked (ApiTargetBlockedMapError)",
      desc: "The Maps JavaScript API was blocked for the current credential. In Google Cloud Console, ensure 'Maps JavaScript API' is enabled and that HTTP Referrers include your deployment URL.",
    };
  }, [rawApiKey, isValidFormat]);

  return (
    <div className="w-full relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col shadow-2xl">
      {/* Google Maps Controls Bar */}
      <div className="p-3 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950 text-blue-300 font-mono text-[11px] font-bold border border-blue-800/60">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            GOOGLE MAPS PLATFORM
          </span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            Geodesic Air Corridors & Terminal Hubs
          </span>
        </div>

        {/* Map Type Switcher */}
        {!isMapDisabled && (
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-[11px]">
            {(
              [
                { id: "hybrid", label: "Hybrid Satellite" },
                { id: "satellite", label: "Pure Satellite" },
                { id: "roadmap", label: "Aero Roadmap" },
                { id: "terrain", label: "Terrain" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setMapType(t.id)}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  mapType === t.id
                    ? "bg-blue-600 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Map Viewport */}
      <div className="w-full h-[540px] relative bg-slate-950 flex items-center justify-center">
        {isMapDisabled ? (
          <div className="p-6 max-w-lg mx-auto text-center space-y-4 z-10">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-950/20">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-bold text-white tracking-tight">
                {keyErrorNotice.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {keyErrorNotice.desc}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {onFallbackToSchematic && (
                <button
                  onClick={onFallbackToSchematic}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold transition shadow-lg shadow-cyan-950 cursor-pointer flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>Switch to Radar Vector Map</span>
                </button>
              )}
              <a
                href="https://console.cloud.google.com/google/maps-apis/credentials?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 font-mono text-xs transition flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Console Credentials</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>

            {/* Quick Sector Navigator within Fallback */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-left">
              <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
                <span>Active Indian Sector:</span>
                <span className="text-cyan-400 font-bold">{selectedRoute.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Median Spot Fare</span>
                  <span className="text-white font-bold">₹{selectedRoute.currentMedianPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Lead-Time Curve (T-0)</span>
                  <span className="text-amber-400 font-bold">₹{selectedRoute.advanceCurve.t0.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <APIProvider apiKey={rawApiKey} onError={() => setAuthFailed(true)} solutionChannel="GMP_aistudio">
          <Map
            id="aeronex-google-map"
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
            defaultCenter={{ lat: 21.8, lng: 78.9 }}
            defaultZoom={4.8}
            mapTypeId={mapType}
            gestureHandling="greedy"
            disableDefaultUI={false}
            className="w-full h-full"
          >
            {/* Draw Corridors */}
            <FlightCorridorsPolylineOverlay
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={onSelectRoute}
            />

            {/* Airport Hub Advanced Markers */}
            {Object.values(AIRPORT_COORDINATES).map((hub) => {
              const isOrigin = selectedRoute?.origin === hub.code;
              const isDest = selectedRoute?.destination === hub.code;
              const isEndpoint = isOrigin || isDest;

              return (
                <AdvancedMarker
                  key={hub.code}
                  position={{ lat: hub.lat, lng: hub.lng }}
                  onClick={() => setSelectedAirport(hub)}
                  title={`${hub.code} - ${hub.name}`}
                >
                  <div className="relative group cursor-pointer flex flex-col items-center">
                    {/* Ring for active corridor terminals */}
                    {isEndpoint && (
                      <div
                        className={`absolute -inset-2 rounded-full animate-ping opacity-75 ${
                          isOrigin ? "bg-cyan-500" : "bg-amber-500"
                        }`}
                      />
                    )}

                    {/* Badge */}
                    <div
                      className={`px-2 py-1 rounded-md text-[11px] font-mono font-black flex items-center gap-1 shadow-lg border transition-transform duration-200 group-hover:scale-110 ${
                        isEndpoint
                          ? isOrigin
                            ? "bg-cyan-500 text-slate-950 border-white ring-2 ring-cyan-300"
                            : "bg-amber-500 text-slate-950 border-white ring-2 ring-amber-300"
                          : hub.type === "major"
                          ? "bg-slate-900 text-cyan-300 border-cyan-500/80"
                          : "bg-slate-900 text-slate-300 border-slate-700"
                      }`}
                    >
                      <Plane className="w-3 h-3 transform -rotate-45" />
                      <span>{hub.code}</span>
                    </div>

                    {/* Sub-label */}
                    <span className="text-[9px] font-bold text-white bg-slate-950/80 px-1 rounded mt-0.5 whitespace-nowrap shadow">
                      {hub.city}
                    </span>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* InfoWindow for selected airport */}
            {selectedAirport && (
              <InfoWindow
                position={{ lat: selectedAirport.lat, lng: selectedAirport.lng }}
                onCloseClick={() => setSelectedAirport(null)}
              >
                <div className="p-1 text-slate-900 max-w-xs font-sans">
                  <div className="flex items-center justify-between border-b pb-1.5 mb-1.5">
                    <span className="font-mono text-sm font-black text-blue-700">
                      {selectedAirport.code} · {selectedAirport.city}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold uppercase">
                      {selectedAirport.type} Hub
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    {selectedAirport.name}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono bg-slate-100 p-2 rounded">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Daily Flights:</span>
                      <strong className="text-slate-800">{selectedAirport.dailyFlights}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Annual Pax:</span>
                      <strong className="text-slate-800">{selectedAirport.paxMillions}M</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Active Terminals:</span>
                      <strong className="text-slate-800">{selectedAirport.terminals}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">DigiYatra:</span>
                      <strong className="text-emerald-600">Enabled</strong>
                    </div>
                  </div>

                  {/* Connected Corridors */}
                  <div className="mt-2 pt-1 border-t text-[10px]">
                    <span className="text-slate-500 block mb-1">Key Corridors from {selectedAirport.code}:</span>
                    <div className="flex flex-wrap gap-1">
                      {routes
                        .filter(
                          (r) =>
                            r.origin === selectedAirport.code ||
                            r.destination === selectedAirport.code
                        )
                        .slice(0, 4)
                        .map((r) => (
                          <button
                            key={r.id}
                            onClick={() => {
                              onSelectRoute(r.id);
                              setSelectedAirport(null);
                            }}
                            className="px-1.5 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded border border-blue-200 transition cursor-pointer font-mono"
                          >
                            {r.origin}➔{r.destination}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
        )}

        {/* Floating Sector Quick-Card Overlay */}
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 max-w-xs shadow-xl pointer-events-auto">
          <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Active Corridor Telemetry</span>
          </div>
          <div className="text-sm font-bold text-white mt-1 flex items-center gap-2">
            <span>{selectedRoute.origin}</span>
            <span className="text-slate-500">➔</span>
            <span>{selectedRoute.destination}</span>
            <span className="text-xs text-cyan-300 font-mono ml-auto">
              ₹{selectedRoute.currentMedianPrice.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between font-mono">
            <span>DGCA Share: {(selectedRoute.dgcaWeight * 100).toFixed(1)}%</span>
            <span
              className={`font-bold ${
                selectedRoute.momChange >= 0 ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              MoM: {selectedRoute.momChange >= 0 ? "+" : ""}
              {selectedRoute.momChange}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
