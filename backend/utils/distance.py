from geopy.distance import geodesic

def calculate_distance(user_lat: float, user_lon: float, hospital_lat: float, hospital_lon: float) -> float:
    """
    Calculate the geodesic distance between user and hospital in kilometers.
    """
    user_coords = (user_lat, user_lon)
    hospital_coords = (hospital_lat, hospital_lon)
    return round(geodesic(user_coords, hospital_coords).km, 2)
