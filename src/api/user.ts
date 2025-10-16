import axios from "axios";
import { getAuthToken } from "./auth";
import { API_URL } from "./api";

export interface UserStats {
  bestWPM: number;
  avgAccuracy: number;
  gamesPlayed: number;
}

export interface Challenge {
  type: "wpm" | "accuracy" | "games_played" | "wins" | "win_streak";
  goal: string;
  currentValue: number;
  targetValue: number;
  expiresAt: string;
  completed: boolean;
}

export interface UserData {
  _id: string;
  username: string;
  email: string;
  solo_stats: UserStats;
  multiplayer_stats: UserStats;
  daily_challenge: Challenge;
  weekly_challenge: Challenge;
  access_level: "user" | "admin";
}

/**
 * Get user data using JWT token from cookies
 */
export const getUserData = async (): Promise<UserData> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error("No authentication token found");
  }

  console.log("Start")

  const response = await axios.get(`${API_URL}/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  console.log("End")
  
  return response.data;
};

export const isAdminUser = (user: UserData) => {
  return user.access_level === "admin";
}

export const isAdmin = async (user?: UserData) => {
  if (!user) {
    user = await getUserData();
  }

  return user.access_level === "admin";
}

export const registerSoloPractice = async (wpm: number, accuracy: number) => {
  const token = getAuthToken();

  const response = await axios.post(`${API_URL}/users/solo_practice`, {
    wpm,
    accuracy
  }, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined
    }
  });
  
  return response.data;
}