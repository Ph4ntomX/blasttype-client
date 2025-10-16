import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Spinner } from "@heroui/spinner";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Chip } from "@heroui/chip";
import toast from "react-hot-toast";

import DefaultLayout from "@/layouts/default";
import { title, subtitle } from "@/components/primitives";
import { Game, getGames } from "@/api/games";
import { getAuthToken } from "@/api/auth";

type Difficulty = "easy" | "medium" | "hard" | "all";
type SortBy = "date" | "wpm";

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

const difficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "success";
    case "medium":
      return "primary";
    case "hard":
      return "danger";
    default:
      return "default";
  }
};

export default function GamesArchivePage() {
  const navigate = useNavigate();
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("all");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>("date");

  const capitalizedDifficulty = useMemo(() => {
    return selectedDifficulty === "all"
      ? "All"
      : selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1);
  }, [selectedDifficulty]);

  const loggedIn = getAuthToken() !== null;
  if (!loggedIn) {
    return <Navigate to="/signup" />;
  }

  // Fetch games when filters change
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await getGames({
          page,
          limit: 10,
          search: searchQuery || undefined,
          sort: sortBy,
          difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
        });

        setGames(data);

        // Check next page existence
        const nextData = await getGames({
          page: page + 1,
          limit: 10,
          search: searchQuery || undefined,
          sort: sortBy,
          difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
        });

        setHasNextPage(nextData.length > 0);
      } catch (error) {
        toast.error("Failed to load games.");
        console.error("Error fetching games:", error);
        setGames([]);
        setHasNextPage(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [page, searchQuery, selectedDifficulty, sortBy]);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setSearchQuery(e.target.value);
  };

  const onDifficultySelect = (key: string | number) => {
    setPage(1);
    setSelectedDifficulty(String(key) as Difficulty);
  };

  const onSortSelect = (key: string | number) => {
    setSortBy(String(key) as SortBy);
  };

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => p + 1);

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="mb-8">
            <h1 className={title({ size: "sm" })}>Check out Previous Games</h1>
            <p className={subtitle()}>Look through previous games played</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Input
              type="text"
              label="Search winner"
              placeholder="Filter by winner username"
              value={searchQuery}
              onChange={onSearchChange}
              className="flex-grow"
            />

            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered">{`Difficulty: ${capitalizedDifficulty}`}</Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Difficulty options" onAction={onDifficultySelect}>
                <DropdownItem key="all">All</DropdownItem>
                <DropdownItem key="easy">Easy</DropdownItem>
                <DropdownItem key="medium">Medium</DropdownItem>
                <DropdownItem key="hard">Hard</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered">{`Sort: ${sortBy === "date" ? "Date" : "WPM"}`}</Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Sort options" onAction={onSortSelect}>
                <DropdownItem key="date">Date</DropdownItem>
                <DropdownItem key="wpm">WPM</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner size="lg" color="primary" />
              <p className="mt-4 text-default-500">Loading games...</p>
            </div>
          )}

          {/* No Results */}
          {!isLoading && games.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl">No games found.</p>
              <p className="text-default-500 mt-2">Try adjusting your search or filters.</p>
            </div>
          )}

          {/* Games Grid */}
          {!isLoading && games.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game, idx) => (
                <motion.div key={`${game.winner._id}-${idx}-${game.playedAt}`} whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Card className="h-full">
                    <CardBody className="pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold">Winner: {game.winner.username}</h3>
                        <Chip color={difficultyColor(game.passage.difficulty)} variant="dot">
                          {game.passage.difficulty.charAt(0).toUpperCase() + game.passage.difficulty.slice(1)}
                        </Chip>
                      </div>
                      <p className="text-default-500 mb-2">Played: {formatDate(game.playedAt)}</p>
                      <p className="text-default-500 mb-2">Top WPM: {game.winner.wpm} • Top Accuracy: {game.winner.accuracy}%</p>
                      <p className="text-default-500">
                        Passage: {game.passage.text.length > 80 ? `${game.passage.text.substring(0, 80)}...` : game.passage.text}
                      </p>
                    </CardBody>
                    <CardFooter className="flex flex-row justify-between gap-5 items-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-md text-default-500">Players:</span>
                        <div className="flex flex-wrap gap-2">
                          {game.players.slice(0, 3).map((p) => (
                          <Chip
                            key={p._id}
                            color={p._id === game.winner._id ? "success" : "default"}
                            className="text-xs"
                          >
                            {p.username}
                          </Chip>
                        ))}
                        {game.players.length > 3 && (
                          <Chip color="default" className="text-xs">+{game.players.length - 3} more</Chip>
                        )}
                        </div>
                      </div>
                      <Button
                        color="primary"
                        onPress={() => navigate(`/practice/${game.passage._id}`)}
                        className="self-end"
                      >
                        Practice Passage
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center gap-4 mt-8">
            <Button variant="flat" onPress={goPrev} isDisabled={page <= 1}>Previous</Button>
            <Button variant="flat" onPress={goNext} isDisabled={!hasNextPage}>Next</Button>
          </div>
        </motion.div>
      </div>
    </DefaultLayout>
  );
}