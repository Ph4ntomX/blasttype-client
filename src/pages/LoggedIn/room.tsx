import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import toast from "react-hot-toast";

import DefaultLayout from "@/layouts/default";
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/api/api";
import { getAuthToken } from "@/api/auth";
import { getUserData } from "@/api/user";

type Phase = "waiting" | "game_countdown" | "game";

interface Player {
  username: string;
  wpm?: number;
  accuracy?: number;
  progress?: number;
  placement?: number;
}

interface ResultsPayload {
  wpm: number;
  accuracy: number;
  elapsedTime: number; // seconds
  placement: number;
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function getDifficultyColor(d: string): "success" | "primary" | "danger" {
  if (d === "easy") return "success";
  if (d === "medium") return "primary";
  return "danger";
}

function getMedalEmoji(place: number): string {
  if (place === 1) return "🥇";
  if (place === 2) return "🥈";
  if (place === 3) return "🥉";
  return "";
}

export default function GamePage() {
  const { difficulty } = useParams<{ difficulty: "easy" | "medium" | "hard" }>();
  const navigate = useNavigate();

  const socketRef = useRef<Socket | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [incorrectSpelling, setIncorrectSpelling] = useState(false);
  const [accuracy, setAccuracy] = useState(100);
  const [players, setPlayers] = useState<Player[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapsLockOn, setIsCapsLockOn] = useState<boolean>(false);
  const [finalResults, setFinalResults] = useState<ResultsPayload | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const wordsRef = useRef<string[]>([]);

  const loggedIn = getAuthToken() !== null;
  if (!loggedIn) {
    return <Navigate to="/signup" />;
  }

  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  // Connect to room namespace and bind events
  useEffect(() => {
    if (!difficulty) {
      toast.error("No difficulty provided");
      navigate("/selection");
      return;
    }

    const token = getAuthToken();
    const socket = io(`${API_URL}/${difficulty}`, {
      transports: ["websocket"],
      auth: token ? { token } : undefined,
    });
    socketRef.current = socket;

    socket.on("phase", (p: Phase) => {
      setPhase(p);
      if (p === "game") {
        startTimeRef.current = Date.now();
      } else {
        startTimeRef.current = null;
      }
    });

    socket.on("passage", (passage: { text: string }) => {
      const text = passage?.text || "";
      if (!text.trim()) {
        toast.error("Room has no passage");
        setIsLoading(false);
        return;
      }
      const wordArray = text.trim().split(/\s+/);
      setWords(wordArray);
      setCurrentIndex(0);
      setCurrentInput("");
      setIncorrectSpelling(false);
      setIsLoading(false);
    });

    socket.on("update_players", (list: any[]) => {
      if (!list?.length) {
        return;
      }

      // find current player in list
      getUserData().then((user) => {
        const currentPlayer = list.find((p) => p.username === user?.username);

        setAccuracy(Math.round(currentPlayer?.accuracy || 0));
      })

      setPlayers((list || []).map((p) => ({
        username: p.username,
        wpm: Math.round(p.wpm || 0),
        placement: p.placement,
        accuracy: Math.round(p.accuracy || 0),
        progress: Math.round(p.progress || 0),
      })));
    });

    socket.on("countdown", (sec: number) => setCountdown(sec));

    socket.on("next_word", (ok: boolean) => {
      if (ok) {
        setCurrentIndex((idx) => idx + 1);
        setCurrentInput("");
        setIncorrectSpelling(false);
      } else {
        setIncorrectSpelling(true);
      }
    });

    socket.on("results", (payload: ResultsPayload) => {
      setFinalResults(payload);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);

      navigate("/selection");
      toast.error("Failed to connect to room");
    });

    socket.on("disconnect", () => {
      navigate("/selection");

      if (!finalResults) {
        toast.error("Disconnected from room");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [difficulty, navigate]);

  useEffect(() => {
    if (phase === "game" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase]);

  const handleInputChange = (value: string) => {
    setCurrentInput(value);

    if (phase !== "game") return;

    const expectedWord = words[currentIndex] || "";

    let isWrongWord = false;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== expectedWord[i]) {
        isWrongWord = true;
        break;
      }
    }

    setIncorrectSpelling(isWrongWord);

    const shouldSubmit = (isWrongWord || (currentIndex === words.length - 1 && value === words[currentIndex]) || value.endsWith(" "));
    if (shouldSubmit) {
      submitWord(value);
    }
  };

  const submitWord = (value: string) => {
    if (!socketRef.current) return;
    const payload = {
      word: value.trim(),
      elapsedTime: startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 0,
    };
    
    socketRef.current.emit("typed_input", payload);
  };

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Spinner color="primary" size="lg" />
          <p className="mt-4 text-default-500">Connecting to room...</p>
        </div>
      </DefaultLayout>
    );
  }

  if (words.length === 0) {
    return (
      <DefaultLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Spinner color="primary" size="lg" />
          <p className="mt-4 text-default-500">Waiting for room passage...</p>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div key="game" animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} transition={{ duration: 0.5 }}>
          <div className="mb-8">
            {players.length === 0 ? (
              <div className="text-center text-default-500">Waiting for players to join...</div>
            ) : (
              <AnimatePresence initial={true}>
                {players.map((p) => {
                  const prog = p.progress ?? 0;
                  return (
                    <motion.div
                      key={p.username}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="mb-3"
                    >
                      <div className="relative h-8 bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 rounded-lg">
                        <motion.div
                          animate={{ width: `${prog}%` }}
                          className="absolute top-0 left-0 h-full bg-pink-200 border-3 border-pink-500 rounded-lg"
                          initial={{ width: "0%" }}
                          transition={{ duration: 0.3 }}
                        />

                        {p.placement == null && <motion.img
                          animate={{ left: `calc(${prog}% - 24px)` }}
                          className="h-[200%] aspect-square absolute drop-shadow-lg"
                          initial={{ left: "0%" }}
                          style={{ transform: "translate(0%, -25%)" }}
                          src="/rocket.gif"
                          alt="rocket"
                        />}
                        

                        <motion.div
                          animate={{ left: `calc(${prog}% ${prog > 50 ? "- 120px" : "+ 36px"})`, top: `${p.placement == null && prog > 50 ? "150%" : "50%"}` }}
                          className="absolute -translate-y-1/2 flex items-center gap-2"
                          initial={{ left: "0%" }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            animate={{ opacity: 1 }}
                            className="bg-black/70 px-3 py-1 rounded-full text-yellow-400 font-bold text-sm whitespace-nowrap"
                            initial={{ opacity: 0 }}
                          >
                            {p.username} • {p.placement ? `#${p.placement} ${getMedalEmoji(p.placement)}` : `${p.wpm ?? 0} WPM`}
                          </motion.div>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {finalResults ? (
            <motion.div
              key="results"
              animate={{ opacity: 1, scale: 1, y: 0 }}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="max-w-2xl mx-auto rounded-4xl bg-neutral-50 dark:bg-neutral-900 text-center p-12 mb-8"
            >
              <h1 className="text-3xl text-yellow-500 font-bold mb-8">
                {`Placement #${finalResults.placement}`} {getMedalEmoji(finalResults.placement)}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="shadow-md bg-neutral-200 dark:bg-neutral-950 rounded-lg p-6">
                  <p className="text-cyan-500 font-semibold mb-2">WPM</p>
                  <p className="text-3xl font-bold">{Math.round(finalResults.wpm)}</p>
                </div>
                <div className="shadow-md bg-neutral-200 dark:bg-neutral-950 rounded-lg p-6">
                  <p className="text-pink-500 font-semibold mb-2">Accuracy</p>
                  <p className="text-3xl font-bold">{Math.round(finalResults.accuracy)}%</p>
                </div>
                <div className="shadow-md bg-neutral-200 dark:bg-neutral-950 rounded-lg p-6">
                  <p className="text-blue-500 font-semibold mb-2">Time</p>
                  <p className="text-3xl font-bold">{Math.round(finalResults.elapsedTime)}s</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="bordered" onPress={() => navigate("/selection")}>
                  Leave Room
                </Button>
              </div>
            </motion.div>
          ) : <Card className="mb-6 shadow-lg">
            <CardBody className="p-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <Chip color={getDifficultyColor(difficulty!)} variant="dot">
                    {capitalize(difficulty!)}
                  </Chip>
                  {isCapsLockOn && (
                    <Chip color="warning" variant="dot">
                      Caps: ON
                    </Chip>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="flat" onPress={() => navigate("/selection")}>
                    Leave Room
                  </Button>
                </div>
              </div>

              {/* Status banner above typing area */}
              <div className="mb-4 text-center">
                <div className="inline-block px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-900 text-default-700 dark:text-default-400 font-medium">
                  {phase === "waiting" && (
                    countdown !== null ? `Game starts in ${countdown} seconds` : "Waiting for game to start..."
                  )}
                  {phase === "game_countdown" && (
                    countdown !== null ? `The typing will commence in ${countdown} seconds` : "Preparing to start..."
                  )}
                  {phase === "game" && (
                    countdown !== null ? `The game will end in ${countdown} seconds` : "Game in progress"
                  )}
                </div>
              </div>

              <div className="mb-6 p-6 bg-neutral-100 dark:bg-neutral-950 rounded-lg min-h-[200px] text-xl leading-relaxed">
                {words.map((word, index) => {
                  let color = "text-default-500";
                  if (index < currentIndex) {
                    color = "text-green-500";
                  } else if (index === currentIndex) {
                    color = `${incorrectSpelling ? "text-red-500" : "text-default-500"} underline decoration-2 decoration-text-default-100 underline-offset-4`;
                  }
                  return (
                    <span key={index} className={`${color} mr-2 whitespace-nowrap`}>
                      {word}
                    </span>
                  );
                })}
              </div>

              <Input
                ref={inputRef}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                autoFocus={true}
                label="Type here"
                placeholder={phase !== "game" ? "Waiting for game to start..." : words[currentIndex]}
                size="lg"
                spellCheck="false"
                disabled={phase !== "game"}
                type="text"
                value={currentInput}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => setIsCapsLockOn(e.getModifierState("CapsLock"))}
                onKeyUp={(e) => setIsCapsLockOn(e.getModifierState("CapsLock"))}
              />

              <div className="flex flex-col gap-4 mt-6">
                <div className="flex justify-between text-sm text-default-500">
                  <span>Progress: {currentIndex} / {words.length} words</span>
                  <span>Accuracy: {accuracy}%</span>
                </div>
              </div>
            </CardBody>
          </Card>}
        </motion.div>
      </div>
    </DefaultLayout>
  );
}
