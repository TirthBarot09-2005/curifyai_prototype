# Patient Frontend Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the patient-side hospital search and results experience into a polished, intelligent, and map-integrated UI.

**Architecture:** Split the results page into a dual-pane layout (60% Map, 40% List). Enhance individual hospital cards with AI reasoning blocks and improve map interactivity through cross-component state management.

**Tech Stack:** React, Tailwind CSS, Lucide React, Leaflet (React-Leaflet).

---

### Task 1: AI Reasoning Section in Hospital Card

**Files:**
- Modify: `frontend/src/components/HospitalCard.jsx`

- [ ] **Step 1: Add reasoning logic and UI**
Modify `HospitalCard.jsx` to include the "Why this hospital?" section below the cost details.

```jsx
// Inside HospitalCard.jsx
// Import Sparkles from lucide-react
import { Sparkles, CheckCircle2 } from "lucide-react";

// Add this section after the cost breakdown summary
<div className="mt-4 p-3 bg-brand-500/5 rounded-xl border border-brand-500/10 animate-fade-in">
  <div className="flex items-center gap-2 mb-2 text-brand-400">
    <Sparkles className="w-4 h-4" />
    <span className="text-xs font-bold uppercase tracking-wider">Why this hospital?</span>
  </div>
  <ul className="space-y-1.5">
    {[
      `Best match for ${hospital.specialties[0] || 'your procedure'} in ${hospital.city}`,
      hospital.cost_breakdown.total_max <= (budgetMax || 2000000) ? "Falls within your selected budget range" : "High quality care at a premium value",
      `Optimized for patient demographic requirements`,
      hospital.accreditation.includes("NABH") ? "NABH/JCI accredited facility" : "High reported clinical success rate"
    ].map((text, i) => (
      <li key={i} className="flex items-start gap-2 text-[13px] text-surface-300">
        <div className="mt-1.5 w-1 h-1 rounded-full bg-brand-500/50" />
        {text}
      </li>
    ))}
  </ul>
</div>
```

- [ ] **Step 2: Commit**
```bash
git add frontend/src/components/HospitalCard.jsx
git commit -m "feat: add AI reasoning section to hospital cards"
```

---

### Task 2: Dual-Pane Results Layout (60/40)

**Files:**
- Modify: `frontend/src/pages/ResultsPage.jsx`

- [ ] **Step 1: Restructure layout to split-pane**
Update the main container to use a grid layout on large screens.

```jsx
// frontend/src/pages/ResultsPage.jsx
return (
  <div className="h-[calc(100vh-4rem)] flex flex-col">
    {/* Top bar with filters remains as is but inside a container */}
    <div className="p-4 bg-surface-950 border-b border-surface-800">
       <div className="max-w-7xl mx-auto flex ...">
         {/* Filter UI here */}
       </div>
    </div>

    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      {/* Map Pane - 60% */}
      <div className="w-full lg:w-[60%] h-[40vh] lg:h-auto border-r border-surface-800">
        <MapView 
          hospitals={hospitals} 
          selectedId={selectedId} 
          onMarkerClick={handleMarkerClick} 
        />
      </div>

      {/* List Pane - 40% */}
      <div className="w-full lg:w-[40%] overflow-y-auto p-4 custom-scrollbar bg-surface-950/50">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs text-surface-500 uppercase font-bold tracking-widest">
            Showing {hospitals.length} hospitals • Updated just now
          </span>
        </div>
        <div className="space-y-4">
          {hospitals.map((h, i) => (
            <div 
              key={h.id} 
              id={`card-${h.id}`}
              className={i === 0 ? "relative" : ""}
            >
              {i === 0 && (
                <div className="absolute -top-2 -left-2 z-10 bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-brand-500/40 animate-bounce">
                  BEST MATCH
                </div>
              )}
              <HospitalCard 
                hospital={h} 
                isSelected={selectedId === h.id} 
                onClick={() => setSelectedId(h.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
```

- [ ] **Step 2: Commit**
```bash
git add frontend/src/pages/ResultsPage.jsx
git commit -m "style: implement 60/40 split-pane results layout"
```

---

### Task 3: Map Marker Interaction & Card Sync

**Files:**
- Modify: `frontend/src/components/MapView.jsx`
- Modify: `frontend/src/pages/ResultsPage.jsx`

- [ ] **Step 1: Update MapView to handle selection and popups**
Add props for `hospitals` and `selectedId`, and implement custom popups.

```jsx
// frontend/src/components/MapView.jsx
const MapView = ({ hospitals, selectedId, onMarkerClick }) => {
  // ... existing setup ...
  
  return (
    <div className="relative h-full w-full">
      <MapContainer ...>
        {/* ... */}
        {hospitals.map(h => (
          <Marker 
            key={h.id} 
            position={[h.lat, h.lon]} 
            icon={selectedId === h.id ? selectedIcon : defaultIcon}
            eventHandlers={{
              click: () => onMarkerClick(h.id)
            }}
          >
            <Popup className="custom-popup">
              <div className="p-2">
                <h4 className="font-bold text-sm">{h.name}</h4>
                <p className="text-xs text-brand-400 font-bold">₹{h.cost_breakdown.total_min} - {h.cost_breakdown.total_max}</p>
                <p className="text-[10px] text-surface-500">{h.proximity_km} km away</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Recenter Button */}
      <button 
        onClick={handleRecenter}
        className="absolute bottom-6 right-6 z-[1000] p-3 bg-surface-800 border border-surface-700 rounded-full shadow-2xl hover:bg-surface-700 transition-colors"
      >
        <Navigation className="w-5 h-5 text-brand-400" />
      </button>
    </div>
  );
};
```

- [ ] **Step 2: Implement auto-scroll logic in ResultsPage**
When a marker is clicked, scroll the corresponding card into view.

```jsx
// frontend/src/pages/ResultsPage.jsx
const handleMarkerClick = (id) => {
  setSelectedId(id);
  const element = document.getElementById(`card-${id}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};
```

- [ ] **Step 3: Commit**
```bash
git add frontend/src/components/MapView.jsx frontend/src/pages/ResultsPage.jsx
git commit -m "feat: implement marker-card sync and map recenter"
```

---

### Task 4: Final UX Polish & Empty States

**Files:**
- Modify: `frontend/src/pages/ResultsPage.jsx`
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Add loading and empty state UI**
Show a professional spinner while loading and a clear empty state.

```jsx
// frontend/src/pages/ResultsPage.jsx
if (loading) return (
  <div className="flex flex-col items-center justify-center h-screen bg-surface-950">
    <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mb-4" />
    <p className="text-surface-400 font-medium">Finding the best hospitals for you...</p>
  </div>
);

if (hospitals.length === 0) return (
  <div className="flex flex-col items-center justify-center h-screen bg-surface-950 p-10 text-center">
    <div className="p-6 bg-surface-900 rounded-full mb-6">
      <MapPin className="w-12 h-12 text-surface-600" />
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">No hospitals found</h2>
    <p className="text-surface-400 max-w-md mx-auto mb-8">
      We couldn't find any facilities matching your filters. Try adjusting your budget or searching in a different city.
    </p>
    <button onClick={() => navigate("/search")} className="btn-secondary">
      Back to Search
    </button>
  </div>
);
```

- [ ] **Step 2: Add hover scaling to index.css**
```css
/* frontend/src/index.css */
@layer utilities {
  .card-hover {
    @apply transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-brand-500/10;
  }
}
```

- [ ] **Step 3: Commit**
```bash
git add frontend/src/pages/ResultsPage.jsx frontend/src/index.css
git commit -m "feat: add loading/empty states and card hover effects"
```
