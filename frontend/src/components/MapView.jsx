import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Standard Leaflet Icon Fix for production
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapView({ hospitals = [], selectedId, onMarkerClick, className }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentCenter, setCurrentCenter] = useState([20.5937, 78.9629]); // India
  const [isSearchPageMode, setIsSearchPageMode] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Use a slight timeout to ensure container is fully rendered in the DOM
    const timer = setTimeout(() => {
      const map = L.map(mapContainerRef.current, {
        center: currentCenter,
        zoom: 12,
        zoomControl: false,
        fadeAnimation: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      mapInstanceRef.current = map;
      setIsLoaded(true);
      
      // Force a redraw once everything is mounted
      map.invalidateSize();

      // Attempt geolocation first
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (mapInstanceRef.current) {
              const newCenter = [position.coords.latitude, position.coords.longitude];
              mapInstanceRef.current.setView(newCenter, 13);
              setCurrentCenter(newCenter);
            }
          },
          (error) => {
            console.warn("Geolocation failed/denied, falling back to city geocoding", error);
            geocodeCityFallback();
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        geocodeCityFallback();
      }

      function geocodeCityFallback() {
        const city = user?.city || "Ahmedabad";
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`)
          .then(res => res.json())
          .then(data => {
            if (data && data[0] && mapInstanceRef.current) {
              const newCenter = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
              mapInstanceRef.current.setView(newCenter, 12);
              setCurrentCenter(newCenter);
            }
          })
          .catch(err => console.warn("Initial geocode failed:", err));
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [user?.city]); // Re-init if city changes significantly

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;
    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    const searchPageMode = hospitals.length === 0 && !selectedId;
    setIsSearchPageMode(searchPageMode);

    // Fetch local hospitals if no props provided (Search Page mode)
    if (searchPageMode) {
      // Add user location marker
      const userLocMarker = L.marker(currentCenter, { icon: redIcon })
        .addTo(map)
        .bindPopup(`<div style="min-width: 100px"><b style="color: #111; font-size: 13px;">📍 Your Location</b></div>`);
      userMarkerRef.current = userLocMarker;

      // Use currentCenter for nearby search
      fetch(`/api/hospitals/nearby?lat=${currentCenter[0]}&lon=${currentCenter[1]}&radius=50`)
        .then(res => res.json())
        .then(data => {
          if (data && data.hospitals) {
            renderMarkers(data.hospitals, true);
            // Auto-fit bounds to include user + all hospitals
            const allCoords = [[currentCenter[0], currentCenter[1]]];
            data.hospitals.forEach(h => {
              const lat = parseFloat(h.latitude || h.lat);
              const lon = parseFloat(h.longitude || h.lon);
              if (!isNaN(lat) && !isNaN(lon)) allCoords.push([lat, lon]);
            });
            if (allCoords.length > 1) {
              const bounds = L.latLngBounds(allCoords);
              map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
            }
          }
        })
        .catch(console.warn);
    } else {
      renderMarkers(hospitals, false);
      
      // Auto-fit bounds if we have hospitals
      if (hospitals.length > 0) {
        const coords = hospitals
          .map(h => [parseFloat(h.latitude || h.lat), parseFloat(h.longitude || h.lon)])
          .filter(c => !isNaN(c[0]) && !isNaN(c[1]));
        
        if (coords.length > 0) {
          const bounds = L.latLngBounds(coords);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      }
    }

    function renderMarkers(list, isNearbyMode) {
      list.forEach((h, index) => {
        const lat = parseFloat(h.latitude || h.lat);
        const lon = parseFloat(h.longitude || h.lon);
        if (isNaN(lat) || isNaN(lon)) return;

        // Generate a stable ID for OSM hospitals that don't have one
        const markerId = h.id || `nearby-${index}-${lat.toFixed(4)}-${lon.toFixed(4)}`;

        const marker = L.marker([lat, lon], {
          icon: h.id === selectedId ? greenIcon : blueIcon
        })
        .addTo(map);
        
        // Add custom click handler only for results page (where onMarkerClick is provided)
        if (onMarkerClick && h.id) {
          marker.on('click', () => onMarkerClick(h.id));
        }
        
        // Build directions URL — use user's current position if available
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
        
        // Contextual popup content
        let detailHtml;
        if (isNearbyMode) {
          // Search page: show address, phone, distance
          const distText = h.distance_km != null ? `${h.distance_km.toFixed(1)} km away` : '';
          const phoneText = h.phone && h.phone !== 'N/A' 
            ? `<a href="tel:${h.phone}" style="color: #3b82f6; text-decoration: none;">📞 ${h.phone}</a>` 
            : '';
          const addrText = h.address && h.address !== 'N/A' ? `<div style="font-size: 11px; color: #888; margin-top: 2px;">${h.address}</div>` : '';
          detailHtml = `
            <div style="min-width: 180px; font-family: sans-serif;">
              <b style="color: #111; font-size: 14px;">${h.name}</b>
              ${addrText}
              <div style="margin-top: 6px; font-size: 12px; color: #555;">
                ${distText}
              </div>
              ${phoneText ? `<div style="margin-top: 4px; font-size: 12px;">${phoneText}</div>` : ''}
              <a href="${googleMapsUrl}" target="_blank" rel="noopener" 
                 style="display: inline-block; margin-top: 8px; padding: 5px 12px; background: #10b981; color: white; border-radius: 6px; font-weight: 600; text-decoration: none; font-size: 12px;">
                🧭 Get Directions
              </a>
            </div>
          `;
        } else {
          // Results page: show cost + distance
          detailHtml = `
            <div style="min-width: 150px; font-family: sans-serif;">
              <b style="color: #111; font-size: 14px;">${h.name}</b><br/>
              <div style="margin-top: 4px; font-size: 11px; color: #666;">
                ₹${h.cost_breakdown?.total_min || '---'} min • ${h.distance_km?.toFixed(1) || h.distance || '?'} km
              </div>
              <a href="${googleMapsUrl}" target="_blank" rel="noopener" 
                 style="display: inline-block; margin-top: 8px; padding: 5px 12px; background: #10b981; color: white; border-radius: 6px; font-weight: 600; text-decoration: none; font-size: 12px;">
                🧭 Get Directions
              </a>
            </div>
          `;
        }
        
        marker.bindPopup(detailHtml);
        markersRef.current[markerId] = marker;
      });
    }
  }, [hospitals, selectedId, isLoaded, currentCenter]);

  // Handle Selection Focus
  useEffect(() => {
    if (selectedId && markersRef.current[selectedId] && mapInstanceRef.current) {
      const marker = markersRef.current[selectedId];
      // Small timeout to ensure map has finished any layout changes before opening popup
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(marker.getLatLng(), 15, { animate: true });
          marker.openPopup();
        }
      }, 100);
    }
  }, [selectedId]);

  return (
    <div className={className || "w-full relative bg-surface-900 rounded-2xl overflow-hidden border border-surface-800 shadow-inner group h-[500px]"}>
      {!isLoaded && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-surface-900">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <span className="ml-3 text-surface-400 font-medium">Loading Map...</span>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      <div className="absolute bottom-6 right-6 z-[400]">
        <button 
          onClick={() => {
            if ("geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  if (mapInstanceRef.current) {
                    const newCenter = [position.coords.latitude, position.coords.longitude];
                    mapInstanceRef.current.setView(newCenter, 13);
                    setCurrentCenter(newCenter);
                  }
                },
                (error) => {
                   console.warn("Geolocation failed during manual recenter", error);
                   // Fallback to city
                   const city = user?.city || "Ahmedabad";
                   fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`)
                     .then(res => res.json())
                     .then(data => {
                       if (data && data[0] && mapInstanceRef.current) {
                         const newCenter = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                         mapInstanceRef.current.setView(newCenter, 12);
                         setCurrentCenter(newCenter);
                       }
                     });
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
              );
            }
          }}
          className="p-3 bg-surface-800 text-brand-400 rounded-full shadow-2xl border border-surface-700 hover:bg-surface-700 transition-all active:scale-95"
          title="Recenter Map to Location"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
