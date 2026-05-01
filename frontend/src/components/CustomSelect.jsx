import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomSelect({ value, onChange, options, placeholder, icon: Icon, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="text-sm text-surface-300 mb-1.5 block font-medium">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-surface-800/80 border rounded-xl px-4 py-3 text-left transition-all duration-200 flex items-center justify-between
          ${isOpen ? "border-brand-500/50 ring-2 ring-brand-500/20" : "border-surface-600/50 hover:border-surface-500"}`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {Icon && <Icon className="w-4 h-4 text-surface-500 shrink-0" />}
          <span className={`truncate ${!value ? "text-surface-400" : "text-surface-100"}`}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-surface-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[100] left-0 right-0 mt-2 bg-surface-800 border border-surface-700 rounded-xl shadow-2xl overflow-hidden"
            style={{ top: "100%" }} // Forces it to open downwards
          >
            {options.length > 10 && (
              <div className="p-2 border-b border-surface-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-500" />
                  <input
                    autoFocus
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-surface-900/50 border border-surface-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-brand-500/50"
                  />
                </div>
              </div>
            )}
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full px-4 py-2.5 text-sm text-left transition-colors flex items-center justify-between
                      ${value === opt ? "bg-brand-500/10 text-brand-400" : "text-surface-300 hover:bg-surface-700/50 hover:text-white"}`}
                  >
                    {opt}
                    {value === opt && <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-xs text-surface-500 text-center italic">No matches found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
