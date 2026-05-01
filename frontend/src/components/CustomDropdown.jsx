import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

export default function CustomDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select option", 
  icon: Icon,
  className = "" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLabel = value || placeholder;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`input-field flex items-center justify-between text-left ${Icon ? "pl-10" : "pl-4"}`}
      >
        <span className="truncate">{selectedLabel === "all" ? placeholder : selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-surface-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" />
      )}

      {/* Menu */}
      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full glass-card border border-surface-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
          {/* Search bar inside dropdown if many options */}
          {options.length > 8 && (
            <div className="p-2 border-b border-surface-700/50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surface-900/50 border border-surface-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-500/50"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-surface-500 italic">No matches found</div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt === "All" || opt === "all" ? "" : opt);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                    ${(value === opt || (value === "" && (opt === "All" || opt === "all"))) 
                      ? "bg-brand-500/10 text-brand-300" 
                      : "text-surface-300 hover:bg-surface-700/50 hover:text-white"}`}
                >
                  <span>{opt}</span>
                  {(value === opt || (value === "" && (opt === "All" || opt === "all"))) && <Check className="w-3.5 h-3.5" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
