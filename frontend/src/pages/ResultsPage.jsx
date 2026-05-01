import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import HospitalCard from "../components/HospitalCard";
import ConfidenceBadge from "../components/ConfidenceBadge";
import DisclaimerBanner from "../components/DisclaimerBanner";
import CustomDropdown from "../components/CustomDropdown";
import { ArrowLeft, Brain, MapPin, Filter, Building2, ChevronDown, Navigation, List, Map as MapIcon } from "lucide-react";
import MapView from "../components/MapView";
import FinancingSection from "../components/FinancingSection";



export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [filterTier, setFilterTier] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState("list");


  // Get filtered hospitals list
  const getFilteredHospitals = () => {
    if (!data) return [];
    let hospitalsList = [...data.hospitals];
    if (filterTier !== "all") hospitalsList = hospitalsList.filter(h => h.tier === filterTier);
    if (filterCity !== "all") hospitalsList = hospitalsList.filter(h => h.city === filterCity);
    if (sortBy === "cost") hospitalsList.sort((a, b) => a.cost_breakdown.total_min - b.cost_breakdown.total_min);
    else if (sortBy === "distance") hospitalsList.sort((a, b) => a.proximity_km - b.proximity_km);
    return hospitalsList;
  };

  const hospitals = getFilteredHospitals();

  const handleMarkerClick = (id) => {
    setSelectedId(id);
    if (activeTab === "list") {
      const element = document.getElementById(`card-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  useEffect(() => {
    if (activeTab === "map" && !selectedId && hospitals.length > 0) {
      setSelectedId(hospitals[0].id);
    }
  }, [activeTab, hospitals, selectedId]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const comorbStr = searchParams.get("comorbidities") || "";
        const res = await apiPost("/search", {
          query: searchParams.get("query") || "",
          location: searchParams.get("location") || "",
          budget_max: parseFloat(searchParams.get("budgetMax") || "5000000"),
          age: parseInt(searchParams.get("age") || "30"),
          comorbidities: comorbStr ? comorbStr.split(",").filter(Boolean) : [],
        });
        setData(res);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch results. Ensure backend is running on port 8000.");
      }
      setLoading(false);
    };
    fetchResults();
  }, [searchParams]);

  const availableCities = data ? [...new Set(data.hospitals.map(h => h.city))].sort() : [];
  const intent = data?.parsed_intent;

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-surface-950 w-full">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        <Brain className="w-6 h-6 text-brand-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      <p className="mt-6 text-surface-400 font-medium animate-pulse">Finding the best hospitals for you...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <p className="text-rose-400 text-lg">{error}</p>
      <button onClick={() => navigate("/search")} className="btn-secondary mt-4">Back to Search</button>
    </div>
  );


  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-surface-950">
      {/* Top bar with filters */}
      <div className="p-4 bg-surface-900 border-b border-surface-800 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          <button onClick={() => navigate("/search")} className="flex items-center gap-1.5 text-surface-400 hover:text-white transition-colors text-sm whitespace-nowrap">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          
          <div className="flex flex-wrap items-center gap-3">
            <CustomDropdown
              options={["All Tiers", "Metro", "Tier2", "Tier3"]}
              value={filterTier === "all" ? "All Tiers" : filterTier}
              onChange={(v) => setFilterTier(v === "All Tiers" ? "all" : v)}
              placeholder="All Tiers"
              icon={Filter}
              className="w-36"
            />
            {availableCities.length > 1 && (
              <CustomDropdown
                options={["All Cities", ...availableCities]}
                value={filterCity === "all" ? "All Cities" : filterCity}
                onChange={(v) => setFilterCity(v === "All Cities" ? "all" : v)}
                placeholder="All Cities"
                icon={Building2}
                className="w-44"
              />
            )}
            <div className="relative">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="input-field py-2.5 pr-8 text-xs w-auto appearance-none bg-surface-800/50">
                <option value="score">Best Match</option>
                <option value="cost">Lowest Cost</option>
                <option value="distance">Nearest</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-500 pointer-events-none" />
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-surface-800/60 p-1 rounded-xl border border-surface-700/50 sm:ml-auto">
            <button
              onClick={() => setActiveTab("list")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === "list"
                  ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                  : "text-surface-400 hover:text-white hover:bg-surface-700/60"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === "map"
                  ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                  : "text-surface-400 hover:text-white hover:bg-surface-700/60"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Map
            </button>
          </div>

          <ConfidenceBadge score={data.confidence_score} />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Map View - Full screen when active */}
        {activeTab === "map" && (
          <div className="w-full h-full relative z-0 bg-surface-900 overflow-hidden animate-fade-in">
            <MapView 
              hospitals={hospitals} 
              selectedId={selectedId} 
              onMarkerClick={handleMarkerClick}
              className="w-full h-full relative bg-surface-900 overflow-hidden"
            />
            {/* Floating hospital count indicator */}
            <div className="absolute top-4 left-4 z-[500]">
              <div className="glass-card px-4 py-2.5 flex items-center gap-2.5 shadow-2xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-surface-200">
                  {hospitals.length} hospitals on map
                </span>
                <span className="text-[10px] text-surface-500">• Click marker for directions</span>
              </div>
            </div>
            {/* Floating selected hospital card */}
            {selectedId && hospitals.find(h => h.id === selectedId) && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] w-[90%] max-w-md animate-slide-up">
                <div className="glass-card p-4 shadow-2xl border-brand-500/20">
                  {(() => {
                    const h = hospitals.find(h => h.id === selectedId);
                    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`;
                    return (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-display font-bold text-white truncate">{h.name}</h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-surface-400">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{h.city}</span>
                              <span>•</span>
                              <span>{h.proximity_km} km</span>
                              <span>•</span>
                              <span className="text-emerald-400 font-medium">₹{h.cost_breakdown?.total_min?.toLocaleString() || '---'}</span>
                            </div>
                            {h.phone && h.phone !== "N/A" && (
                              <a href={`tel:${h.phone}`} className="text-xs text-brand-400 hover:text-brand-300 mt-1 inline-block">{h.phone}</a>
                            )}
                          </div>
                          <div className="text-center flex-shrink-0">
                            <div className={`text-lg font-bold ${h.composite_score >= 0.7 ? 'text-emerald-400' : h.composite_score >= 0.5 ? 'text-amber-400' : 'text-rose-400'}`}>
                              {(h.composite_score * 100).toFixed(0)}
                            </div>
                            <div className="text-[9px] text-surface-500 uppercase">Score</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <a 
                            href={googleMapsUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-primary flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            Get Directions
                          </a>

                          <button 
                            onClick={() => setSelectedId(null)} 
                            className="p-2 text-surface-500 hover:text-white transition-colors rounded-lg hover:bg-surface-700/50"
                            title="Close"
                          >
                            ✕
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {activeTab === "list" && (
          <div className="w-full flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-surface-950/30 animate-fade-in">
            <div className="max-w-3xl mx-auto">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] text-surface-500 uppercase font-bold tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Showing {hospitals.length} hospitals
                </span>
              </div>
              
              <FinancingSection data={data} />
              
              <div className="space-y-4">

                {hospitals.length === 0 ? (
                  <div className="glass-card p-10 text-center">
                    <MapPin className="w-10 h-10 text-surface-500 mx-auto mb-3" />
                    <p className="text-surface-300 text-lg font-medium mb-1">No hospitals found</p>
                    <p className="text-surface-500 text-sm">Try adjusting your filters.</p>
                    <button onClick={() => navigate("/search")} className="btn-secondary mt-5 text-sm">← Modify Search</button>
                  </div>
                ) : (
                  hospitals.map((h, i) => (
                    <div 
                      key={h.id} 
                      id={`card-${h.id}`}
                      className={`transition-all duration-300 ${selectedId === h.id ? 'ring-2 ring-brand-500/50 rounded-2xl' : ''}`}
                      onClick={() => setSelectedId(h.id)}
                    >
                      {i === 0 && (
                        <div className="flex items-center gap-1.5 mb-2 px-1">
                          <div className="bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-brand-500/20">
                             BEST MATCH
                          </div>
                        </div>
                      )}
                      <HospitalCard hospital={h} rank={i} isSelected={selectedId === h.id} />
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
