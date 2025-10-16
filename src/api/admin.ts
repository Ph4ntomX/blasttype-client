import axios from "axios";
import { API_URL } from "./api";
import { getAuthToken } from "./auth";

// Shared helpers
const authHeaders = () => {
  const token = getAuthToken();
  return {
    Authorization: token ? `Bearer ${token}` : undefined,
  };
};

// Passages
export interface AdminPassageInput {
  text: string;
  difficulty: "easy" | "medium" | "hard";
}

export const adminGetPassages = async (search?: string, difficultyFilter?: string) => {
  console.log(search, difficultyFilter)
  const res = await axios.get(`${API_URL}/passages`, { headers: authHeaders(), params: { search, difficulty: difficultyFilter } });
  return res.data;
};

export const adminCreatePassage = async (payload: AdminPassageInput) => {
  const res = await axios.post(`${API_URL}/passages`, payload, { headers: authHeaders() });
  return res.data;
};

export const adminUpdatePassage = async (id: string, payload: Partial<AdminPassageInput>) => {
  const res = await axios.put(`${API_URL}/passages/${id}`, payload, { headers: authHeaders() });
  return res.data;
};

export const adminDeletePassage = async (id: string) => {
  const res = await axios.delete(`${API_URL}/passages/${id}`, { headers: authHeaders() });
  return res.data;
};

// Users
export interface AdminUserInput {
  username: string;
  email: string;
  access_level: "user" | "admin";
  password?: string; // only for create
}

export const adminGetUsers = async () => {
  const res = await axios.get(`${API_URL}/users/admin/`, { headers: authHeaders() });
  return res.data;
};

export const adminCreateUser = async (payload: AdminUserInput) => {
  const res = await axios.post(`${API_URL}/users/admin/`, payload, { headers: authHeaders() });
  return res.data;
};

export const adminUpdateUser = async (id: string, payload: Partial<AdminUserInput>) => {
  const res = await axios.put(`${API_URL}/users/admin/${id}`, payload, { headers: authHeaders() });
  return res.data;
};

export const adminDeleteUser = async (id: string) => {
  const res = await axios.delete(`${API_URL}/users/admin/${id}`, { headers: authHeaders() });
  return res.data;
};

// Challenges
export interface AdminChallengeInput {
  goal: string;
  type: "wpm" | "accuracy" | "games_played" | "wins" | "win_streak";
  targetValue: number;
  period: "daily" | "weekly";
}

export const adminGetChallenges = async () => {
  const res = await axios.get(`${API_URL}/challenges`, { headers: authHeaders() });
  return res.data;
};

export const adminCreateChallenge = async (payload: AdminChallengeInput) => {
  const res = await axios.post(`${API_URL}/challenges`, payload, { headers: authHeaders() });
  return res.data;
};

export const adminUpdateChallenge = async (id: string, payload: Partial<AdminChallengeInput>) => {
  const res = await axios.put(`${API_URL}/challenges/${id}`, payload, { headers: authHeaders() });
  return res.data;
};

export const adminDeleteChallenge = async (id: string) => {
  const res = await axios.delete(`${API_URL}/challenges/${id}`, { headers: authHeaders() });
  return res.data;
};