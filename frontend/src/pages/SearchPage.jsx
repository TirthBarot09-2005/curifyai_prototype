import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, IndianRupee, X, Sparkles, User, ChevronDown } from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";
import CustomDropdown from "../components/CustomDropdown";
import MapView from "../components/MapView";
import { useAuth } from "../context/AuthContext";
import { CITIES, COMORBIDITY_OPTIONS } from "../lib/constants";

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [location, setLocation] = useState(user?.city || "");
  const [budgetMax, setBudgetMax] = useState(2000000);
  const [age, setAge] = useState(35);
  const [comorbidities, setComorbidities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.city && !location && CITIES.includes(user.city)) {
      setLocation(user.city);
    }
  }, [user?.city]);

  const toggleComorbidity = (c) => {
    setComorbidities(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setErrorMsg("please input search query");
      return;
    }
    if (!location) {
      setErrorMsg("please select a city from the list");
      return;
    }
    setErrorMsg("");
    const params = new URLSearchParams({
      query: query.trim(), location, budgetMax: budgetMax.toString(),
      age: age.toString(), comorbidities: comorbidities.join(","),
    });
    navigate(`/results?${params.toString()}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-60 h-60 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-10 sm:py-16">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3 animate-slide-up">
            <Sparkles className="inline w-8 h-8 text-brand-400 mr-2 -mt-1" />
            Find the Right Hospital
          </h1>
          <p className="text-surface-400 animate-slide-up" style={{ animationDelay: "80ms" }}>
            Describe your symptoms or procedure in plain language
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-6 animate-slide-up" style={{ animationDelay: "160ms" }}>
          {/* Main query input */}
          <div className="glass-card p-1.5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <textarea value={query} onChange={(e) => { setQuery(e.target.value); setErrorMsg(""); }}
                className={`w-full bg-transparent rounded-xl pl-12 pr-4 py-4 text-lg text-white placeholder:text-surface-500 focus:outline-none resize-none ${errorMsg && !location && query.trim() ? "ring-2 ring-rose-500/50" : ""}`}
                rows={2}
                placeholder='e.g. "chest pain while walking" or "knee replacement surgery"'
                 />
            </div>
          </div>
          {errorMsg && <p className="text-rose-400 text-sm mt-1 ml-2">{errorMsg}</p>}

          {/* Location & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-surface-300 mb-1.5 block">Location</label>
                <CustomDropdown
                  options={CITIES}
                  value={location}
                  onChange={(val) => { setLocation(val); setErrorMsg(""); }}
                  placeholder="Select your city"
                  icon={MapPin}
                />
            </div>
            <div>
              <label className="text-sm text-surface-300 mb-1.5 block">Age</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  className="input-field pl-10" min={1} max={120} />
              </div>
            </div>
          </div>

          {/* Budget slider */}
          <div>
            <label className="text-sm text-surface-300 mb-1.5 flex justify-between">
              <span>Budget Range</span>
              <span className="text-brand-400 font-medium">Up to ₹{(budgetMax / 100000).toFixed(0)} Lakh</span>
            </label>
            <input type="range" value={budgetMax} onChange={(e) => setBudgetMax(parseInt(e.target.value))}
              min={100000} max={5000000} step={100000}
              className="w-full h-2 bg-surface-700 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-500
                [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-300
                [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-brand-500/30" />
            <div className="flex justify-between text-xs text-surface-500 mt-1">
              <span>₹1L</span><span>₹50L</span>
            </div>
          </div>

          {/* Comorbidities */}
          <div>
            <label className="text-sm text-surface-300 mb-2 block">Comorbidities (if any)</label>
            <div className="flex flex-wrap gap-2">
              {COMORBIDITY_OPTIONS.map(c => (
                <button key={c} type="button" onClick={() => toggleComorbidity(c)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all
                    ${comorbidities.includes(c)
                      ? "bg-brand-500/15 border-brand-500/40 text-brand-300"
                      : "bg-surface-800/50 border-surface-600/30 text-surface-400 hover:border-surface-500"
                    }`}>
                  {comorbidities.includes(c) && <X className="w-3 h-3 inline mr-1" />}
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2">
            <Search className="w-5 h-5" /> Find Hospitals
          </button>
        </form>

        {/* Map View Section */}
        <div className="mt-16 animate-slide-up" style={{ animationDelay: "240ms" }}>
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
              <MapPin className="inline w-6 h-6 text-brand-400 mr-2 -mt-1" />
              Explore Nearby Hospitals
            </h2>
            <p className="text-surface-400">
              Allow location access to find facilities around you
            </p>
          </div>
          <div className="bg-surface-900 rounded-3xl p-1 overflow-hidden shadow-2xl border border-surface-800">
            <MapView />
          </div>
        </div>
      </div>
    </div>
  );
}
