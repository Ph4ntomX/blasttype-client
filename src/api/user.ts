import axios from "axios";
import { getAuthToken } from "./auth";
import { API_URL } from "./api";

export interface UserStats {
  bestWPM: number;
  avgAccuracy: number;
  gamesPlayed: number;
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  solo_stats: UserStats;
  multiplayer_stats: UserStats;
}

/**
 * Get user data using JWT token from cookies
 */
export const getUserData = async (): Promise<UserData> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error("No authentication token found");
  }
  
  const response = await axios.get(`${API_URL}/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data;
};