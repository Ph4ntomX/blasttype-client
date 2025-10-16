import axios from "axios";
import { API_URL } from "./api";
import { getAuthToken } from "./auth";

export interface GameUser {
  _id: string;
  username: string;
  wpm: number;
  accuracy: number;
  progress?: number;
}

export interface GamePassage {
  _id: string;
  text: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface Game {
  winner: GameUser;
  players: GameUser[];
  passage: GamePassage;
  playedAt: string; // ISO date string
}

export interface GetGamesParams {
  page?: number; // 1-indexed
  limit?: number; // default 10
  search?: string; // winner username
  difficulty?: "easy" | "medium" | "hard";
  sort?: "date" | "wpm"; // optional client hint
}

/**
 * Fetch games from API with optional filters and pagination.
 * The backend is expected to support `page`, `limit`, `search`, and `difficulty` params.
 */
export const getGames = async (params: GetGamesParams = {}): Promise<Game[]> => {
  const token = getAuthToken();
  const {
    page = 1,
    limit = 10,
    search,
    difficulty,
    sort,
  } = params;

  const response = await axios.get(`${API_URL}/games`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    params: {
      page,
      limit,
      search,
      difficulty,
      sort,
    },
  });

  return response.data as Game[];
};