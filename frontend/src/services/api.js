import axios from 'axios';

const API_BASE_URL = '/api'; // Update this to your actual API base URL if different

export const fetchNearbyHospitals = async (lat, lon, radius = 50) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/hospitals/nearby`, {
      params: {
        lat,
        lon,
        radius, // Optional parameter if the backend supports it
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching nearby hospitals:', error);
    throw error;
  }
};
