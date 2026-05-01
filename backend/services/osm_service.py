import httpx
import logging
from typing import List, Dict, Optional
from datetime import datetime, timedelta

# Simple in-memory cache
# Key: (lat, lon, radius), Value: (timestamp, data)
_cache: Dict[tuple, tuple] = {}
CACHE_TTL = timedelta(hours=1)

logger = logging.getLogger(__name__)

async def get_nearby_hospitals(lat: float, lon: float, radius_km: float = 10.0) -> List[Dict]:
    """
    Fetch hospitals from OpenStreetMap using Overpass API.
    """
    cache_key = (round(lat, 3), round(lon, 3), radius_km)
    
    # Check cache
    if cache_key in _cache:
        timestamp, data = _cache[cache_key]
        if datetime.now() - timestamp < CACHE_TTL:
            logger.info("Returning OSM results from cache")
            return data

    # Overpass QL query
    # Search for amenity=hospital within radius (in meters)
    radius_m = radius_km * 1000
    query = f"""
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:{radius_m},{lat},{lon});
      way["amenity"="hospital"](around:{radius_m},{lat},{lon});
      relation["amenity"="hospital"](around:{radius_m},{lat},{lon});
    );
    out center;
    """
    
    overpass_url = "https://overpass-api.de/api/interpreter"
    
    try:
        headers = {"User-Agent": "CurifyAINavigator/1.0 (contact: support@curify.ai)"}
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(overpass_url, data={"data": query}, headers=headers)
            response.raise_for_status()
            result = response.json()
            
            hospitals = []
            for element in result.get("elements", []):
                # Nodes have direct lat/lon, ways/relations have "center"
                h_lat = element.get("lat") or element.get("center", {}).get("lat")
                h_lon = element.get("lon") or element.get("center", {}).get("lon")
                tags = element.get("tags", {})
                name = tags.get("name", "Unnamed Hospital")
                phone = tags.get("phone") or tags.get("contact:phone") or "N/A"
                address = (
                    tags.get("addr:full") or 
                    f"{tags.get('addr:street', '')} {tags.get('addr:city', '')}".strip() or 
                    "Local Health District"
                )
                
                if h_lat and h_lon:
                    hospitals.append({
                        "name": name,
                        "latitude": h_lat,
                        "longitude": h_lon,
                        "phone": phone,
                        "address": address
                    })
            
            # Cache the result
            _cache[cache_key] = (datetime.now(), hospitals)
            return hospitals
            
    except httpx.TimeoutException:
        logger.error("Overpass API timeout")
        return []
    except Exception as e:
        logger.error(f"Error fetching from Overpass API: {str(e)}")
        return []
