from fastapi import APIRouter, Query, HTTPException
from typing import List
from pydantic import BaseModel
from database import get_db
from services.osm_service import get_nearby_hospitals
from utils.distance import calculate_distance

router = APIRouter()

class NearbyHospital(BaseModel):
    name: str
    latitude: float
    longitude: float
    distance_km: float
    phone: str = "N/A"
    address: str = "N/A"

class NearbyHospitalsResponse(BaseModel):
    count: int
    hospitals: List[NearbyHospital]

@router.get("/hospitals")
async def list_hospitals():
    conn = get_db()
    rows = conn.execute("SELECT * FROM hospitals ORDER BY reputation_score DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.get("/hospitals/nearby", response_model=NearbyHospitalsResponse)
async def fetch_nearby_hospitals(
    lat: float = Query(..., description="Latitude of user location"),
    lon: float = Query(..., description="Longitude of user location"),
    radius: float = Query(10.0, description="Search radius in KM")
):
    """
    Fetch nearby hospitals from OSM and calculate distances.
    """
    # 1. Fetch from OSM service
    raw_hospitals = await get_nearby_hospitals(lat, lon, radius)
    
    if not raw_hospitals:
        return NearbyHospitalsResponse(count=0, hospitals=[])

    # 2. Process and calculate distances
    processed_hospitals = []
    for h in raw_hospitals:
        dist = calculate_distance(lat, lon, h["latitude"], h["longitude"])
        processed_hospitals.append(NearbyHospital(
            name=h["name"],
            latitude=h["latitude"],
            longitude=h["longitude"],
            distance_km=dist,
            phone=h.get("phone", "N/A"),
            address=h.get("address", "N/A")
        ))

    # 3. Sort by distance and limit to top 20
    processed_hospitals.sort(key=lambda x: x.distance_km)
    top_hospitals = processed_hospitals[:20]

    return NearbyHospitalsResponse(
        count=len(top_hospitals),
        hospitals=top_hospitals
    )
