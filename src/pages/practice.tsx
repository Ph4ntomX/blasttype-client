import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import toast from "react-hot-toast";

import { getPassageById, Passage } from "@/api/passage";
import DefaultLayout from "@/layouts/default";

type Phase = "waiting" | "game" | "results";

interface Stats {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
}

export default function SoloPracticePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [passage, setPassage] = useState<Passage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [correctWords, setCorrectWords] = useState(0);
  const [wrongWords, setWrongWords] = useState(0);
  const [typedText, setTypedText] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [currentWPM, setCurrentWPM] = useState(0);

  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wpmIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchPassage = async () => {
      if (!id) {
        toast.error("No passage ID provided");
        navigate("/passages");

        return;
      }

      try {
        const data = await getPassageById(id);

        if (!data.text || data.text.trim() === "") {
          toast.error("Passage has no text");
          navigate("/passages");

          return;
        }
        setPassage(data);
        const wordArray = data.text.trim().split(/\s+/);

        setWords(wordArray);
        setTypedText(new Array(wordArray.length).fill(""));
      } catch (error) {
        toast.error("Failed to load passage");
        console.error("Error fetching passage:", error);
        navigate("/passages");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPassage();
  }, [id, navigate]);

  useEffect(() => {
    if (phase === "game" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "game" && startTimeRef.current) {
      wpmIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current!) / 1000 / 60;

        if (elapsed > 0) {
          const wpm = Math.round(correctWords / elapsed);

          setCurrentWPM(wpm);
        }
      }, 100);

      return () => {
        if (wpmIntervalRef.current) {
          clearInterval(wpmIntervalRef.current);
        }
      };
    }
  }, [phase, correctWords]);

  const handleInputChange = (value: string) => {
    if (phase === "waiting" && value.length > 0) {
      setPhase("game");
      startTimeRef.current = Date.now();
    }

    setCurrentInput(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") {
      e.preventDefault();
      handleWordSubmit();
    }
  };

  const handleWordSubmit = () => {
    if (currentInput.trim() === "") return;

    const expectedWord = words[currentIndex];
    const isCorrect = currentInput.trim() === expectedWord;

    if (isCorrect) {
      const newTypedText = [...typedText];

      newTypedText[currentIndex] = currentInput.trim();
      setTypedText(newTypedText);
      setCorrectWords((prev) => prev + 1);
      setCurrentIndex((prev) => prev + 1);
      setCurrentInput("");

      if (currentIndex + 1 === words.length) {
        endTimeRef.current = Date.now();
        finishGame();
      }
    } else {
      setWrongWords((prev) => prev + 1);
      toast.error("Incorrect! Please type the correct word.", {
        duration: 1500,
      });
    }
  };

  const finishGame = () => {
    if (wpmIntervalRef.current) {
      clearInterval(wpmIntervalRef.current);
    }

    const timeInSeconds = (endTimeRef.current! - startTimeRef.current!) / 1000;
    const timeInMinutes = timeInSeconds / 60;
    const wpm = Math.round(words.length / timeInMinutes);
    const accuracy = Math.round(
      (correctWords / (correctWords + wrongWords)) * 100,
    );

    const gameStats: Stats = {
      wpm,
      accuracy,
      timeElapsed: Math.round(timeInSeconds),
    };

    setStats(gameStats);
    setPhase("results");

    try {
      const recentGames = JSON.parse(
        localStorage.getItem("recentGames") || "[]",
      );

      recentGames.unshift({
        wpm,
        accuracy,
        timeElapsed: Math.round(timeInSeconds),
        date: new Date().toISOString(),
      });
      localStorage.setItem(
        "recentGames",
        JSON.stringify(recentGames.slice(0, 10)),
      );
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  const handleReset = () => {
    setPhase("waiting");
    setCurrentIndex(0);
    setCurrentInput("");
    setCorrectWords(0);
    setWrongWords(0);
    setTypedText(new Array(words.length).fill(""));
    setStats(null);
    setCurrentWPM(0);
    startTimeRef.current = null;
    endTimeRef.current = null;
    if (wpmIntervalRef.current) {
      clearInterval(wpmIntervalRef.current);
    }
  };

  const progressPercentage =
    words.length > 0 ? (currentIndex / words.length) * 100 : 0;

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Spinner color="primary" size="lg" />
          <p className="mt-4 text-default-500">Loading passage...</p>
        </div>
      </DefaultLayout>
    );
  }

  if (!passage) {
    return null;
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {phase === "results" && stats ? (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardBody className="text-center py-12">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Practice Complete!
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-lg p-6">
                    <p className="text-yellow-500 font-semibold mb-2">WPM</p>
                    <p className="text-5xl font-bold">{stats.wpm}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-6">
                    <p className="text-yellow-500 font-semibold mb-2">
                      Accuracy
                    </p>
                    <p className="text-5xl font-bold">{stats.accuracy}%</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-6">
                    <p className="text-yellow-500 font-semibold mb-2">Time</p>
                    <p className="text-5xl font-bold">{stats.timeElapsed}s</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    className="bg-gradient-to-r from-cyan-500 to-blue-500"
                    color="primary"
                    size="lg"
                    onPress={handleReset}
                  >
                    Retry
                  </Button>
                  <Button
                    size="lg"
                    variant="bordered"
                    onPress={() => navigate("/passages")}
                  >
                    Back to Passages
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <div className="relative h-16 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg overflow-hidden">
                <motion.div
                  animate={{ width: `${progressPercentage}%` }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-30"
                  initial={{ width: "0%" }}
                  transition={{ duration: 0.3 }}
                />

                <motion.div
                  animate={{ left: `${progressPercentage}%` }}
                  className="absolute top-1/2 -translate-y-1/2 flex items-center gap-2"
                  initial={{ left: "0%" }}
                  style={{ transform: "translate(-50%, -50%)" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-3xl drop-shadow-lg">🚀</div>
                  {phase === "game" && currentWPM > 0 && (
                    <motion.div
                      animate={{ opacity: 1 }}
                      className="bg-black/70 px-3 py-1 rounded-full text-cyan-400 font-bold text-sm whitespace-nowrap"
                      initial={{ opacity: 0 }}
                    >
                      {currentWPM} WPM
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>

            <Card className="mb-6 shadow-lg">
              <CardBody className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {passage.title}
                  </h2>
                  <Button
                    color="warning"
                    size="sm"
                    variant="flat"
                    onPress={handleReset}
                  >
                    Reset
                  </Button>
                </div>

                <div className="mb-6 p-6 bg-gradient-to-br from-gray-100 dark:from-gray-900 to-gray-50 dark:to-gray-800 rounded-lg min-h-[200px] text-xl leading-relaxed">
                  {words.map((word, index) => {
                    let color = "text-default-500";

                    if (index < currentIndex) {
                      color = "text-green-500";
                    } else if (index === currentIndex) {
                      color =
                        "text-default-900 dark:text-default-100 underline decoration-2 decoration-cyan-500 underline-offset-4";
                    }

                    return (
                      <span key={index} className={`${color} mr-2`}>
                        {word}
                      </span>
                    );
                  })}
                </div>

                {phase === "waiting" && (
                  <div className="text-center mb-4">
                    <p className="text-default-500 text-lg">
                      Start typing to begin...
                    </p>
                  </div>
                )}

                <Input
                  ref={inputRef}
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  classNames={{
                    input: "text-xl",
                    inputWrapper:
                      "border-2 border-cyan-500/50 hover:border-cyan-500",
                  }}
                  label="Type here"
                  placeholder={
                    phase === "waiting"
                      ? "Start typing to begin..."
                      : words[currentIndex]
                  }
                  size="lg"
                  spellCheck="false"
                  type="text"
                  value={currentInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                {phase === "game" && (
                  <div className="flex justify-between mt-4 text-sm text-default-500">
                    <span>
                      Progress: {currentIndex} / {words.length} words
                    </span>
                    <span>
                      Correct: {correctWords} | Wrong: {wrongWords}
                    </span>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        )}
      </div>
    </DefaultLayout>
  );
}
