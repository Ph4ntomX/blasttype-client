import axios from "axios";
import { getAuthToken } from "./auth";
import { API_URL } from "./api";

export interface Passage {
  _id: string;
  text: string;
  difficulty: "easy" | "medium" | "hard";
}

/**
 * Get all passages with optional filtering
 */
export const getPassages = async (search?: string, difficulty?: string): Promise<Passage[]> => {
  const token = getAuthToken();
  
  let url = `${API_URL}/passages`;
  const params: Record<string, string> = {};
  
  if (search) {
    params.search = search;
  }
  
  if (difficulty) {
    params.difficulty = difficulty;
  }
  
  const response = await axios.get(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined
    },
    params
  });
  
  return response.data;
};

/**
 * Get a random passage by difficulty
 */
export const getRandomPassage = async (difficulty: string): Promise<Passage> => {
  const token = getAuthToken();
  
  const response = await axios.get(`${API_URL}/passages/random`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined
    },
    params: { difficulty }
  });
  
  return response.data[0];
};

/**
 * Get a specific passage by ID
 */
export const getPassageById = async (id: string): Promise<Passage> => {
  const token = getAuthToken();
  
  const response = await axios.get(`${API_URL}/passages/${id}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined
    }
  });
  
  return response.data;
};