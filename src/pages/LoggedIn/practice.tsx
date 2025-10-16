import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import toast from "react-hot-toast";

import { getPassageById } from "@/api/passage";
import { registerSoloPractice } from "@/api/user";
import DefaultLayout from "@/layouts/default";
import { getAuthToken } from "@/api/auth";

type Phase = "waiting" | "game" | "results";

interface Stats {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
}

export default function SoloPracticePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>("waiting");

  const [difficulty, setDifficulty] = useState<string>("");
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [correctCharacters, setCorrectCharacters] = useState(0);
  const [typedCharacters, setTypedCharacters] = useState(0);
  const [WPM, setWPM] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);

  const [incorrectSpelling, setIncorrectSpelling] = useState(false);

  const [stats, setStats] = useState<Stats | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wpmIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Get badge color based on difficulty
  const getDifficultyColor = (difficulty: string) => {
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
  
  const loggedIn = getAuthToken() !== null;
  if (!loggedIn) {
    return <Navigate to="/signup" />;
  }

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

        setDifficulty(data.difficulty);

        const wordArray = data.text.trim().split(/\s+/);

        setWords(wordArray);
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
          const wpm = Math.round(currentIndex / elapsed);
          setWPM(wpm);
        }
      }, 100);

      return () => {
        if (wpmIntervalRef.current) {
          clearInterval(wpmIntervalRef.current);
        }
      };
    }
  }, [phase, currentIndex]);

  const handleInputChange = (value: string) => {
    const expectedWord = words[currentIndex];

    if (phase === "waiting" && value.length > 0) {
      setPhase("game");
      startTimeRef.current = Date.now();
    }

    setCurrentInput(value);

    // check last letter of value if space or empty

    let isWrongWord = false;

    for (let i = 0; i < value.length; i++) {
      if (value[i] !== expectedWord[i]) {
        isWrongWord = true;
        break;
      }
    }

    setIncorrectSpelling(isWrongWord);

    if (isWrongWord || (currentIndex === words.length - 1 && value === words[currentIndex]) || value.endsWith(" ")) {
      handleWordSubmit(value);
    }
  };

  const handleWordSubmit = (value: string) => {
    if (value === "") return;

    const expectedWord = words[currentIndex];

    console.log(value.trim().length, expectedWord.length)

    let correctCount = correctCharacters;
    let typedCount = typedCharacters;

    if (value.trim().length <= expectedWord.length) {
      for (let i = 0; i < Math.min(value.length, expectedWord.length); i++) {
        if (value[i] === expectedWord[i]) {
          correctCount++;
        }

        typedCount++;
      }
    }

    setAccuracy(Math.round((correctCount / typedCount) * 100));
    setCorrectCharacters(correctCount);
    setTypedCharacters(typedCount);

    if (value.trim() === expectedWord) {
      let index = currentIndex + 1;

      setCurrentIndex(index);
      setCurrentInput("");
      setIncorrectSpelling(false);

      console.log(Math.round((index / words.length) * 100))

      setProgressPercentage(Math.round((index / words.length) * 100));

      if (index === words.length) {
        endTimeRef.current = Date.now();
        finishGame();
      }
    }
  };

  const finishGame = () => {
    if (wpmIntervalRef.current) {
      clearInterval(wpmIntervalRef.current);
    }

    const timeInSeconds = (endTimeRef.current! - startTimeRef.current!) / 1000;

    const gameStats: Stats = {
      wpm: WPM,
      accuracy,
      timeElapsed: Math.round(timeInSeconds),
    };

    setStats(gameStats);
    setPhase("results");

    try {
      registerSoloPractice(gameStats.wpm, gameStats.accuracy).then(() => {
        console.log("Saved solo practice")
      });
    } catch (error) {
      toast.error("Failed to register solo practice");
      console.error("Error registering solo practice:", error);
    }
  };

  const handleReset = () => {
    setPhase("waiting");
    setCurrentIndex(0);
    setCurrentInput("");
    setCorrectCharacters(0);
    setTypedCharacters(0);
    setWPM(0);
    setAccuracy(0);
    setProgressPercentage(0);
    setIncorrectSpelling(false);
    setStats(null);
    startTimeRef.current = null;
    endTimeRef.current = null;
    if (wpmIntervalRef.current) {
      clearInterval(wpmIntervalRef.current);
    }
  };

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

  if (words.length === 0) {
    return null;
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {phase === "results" && stats ? (
          <motion.div
            key="results"
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="max-w-2xl mx-auto rounded-4xl bg-neutral-50 dark:bg-neutral-900 text-center p-12"
          >
            <h1 className="text-3xl text-yellow-500 font-bold mb-8">
              Completed Practice Passage
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="shadow-md bg-neutral-200 dark:bg-neutral-950 rounded-lg p-6">
                <p className="text-cyan-500 font-semibold mb-2">WPM</p>
                <p className="text-3xl font-bold">{stats.wpm}</p>
              </div>
              <div className="shadow-md bg-neutral-200 dark:bg-neutral-950 rounded-lg p-6">
                <p className="text-pink-500 font-semibold mb-2">
                  Accuracy
                </p>
                <p className="text-3xl font-bold">{stats.accuracy}%</p>
              </div>
              <div className="shadow-md bg-neutral-200 dark:bg-neutral-950 rounded-lg p-6">
                <p className="text-blue-500 font-semibold mb-2">Time</p>
                <p className="text-3xl font-bold">{stats.timeElapsed}s</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-neutral-200 dark:bg-neutral-950 text-yellow-600 hover:text-yellow-900 dark:hover:text-yellow-50 font-bold py-2 px-6 rounded-lg"
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
          </motion.div>
        ) : (
          <motion.div
            key="game"
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <div className="relative h-8 bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 rounded-lg">
                {phase === "game" && progressPercentage > 0 && (<>
                  <motion.div
                    animate={{ width: `${progressPercentage}%` }}
                    className="absolute top-0 left-0 h-full bg-pink-200 border-3 border-pink-500 rounded-lg"
                    initial={{ width: "0%" }}
                    transition={{ duration: 0.3 }}
                  />

                  <motion.img
                    animate={{ left: `calc(${progressPercentage}% - 24px)` }}
                    className="h-[200%] aspect-square absolute drop-shadow-lg"
                    initial={{ left: "0%" }}
                    style={{ transform: "translate(0%, -25%)" }}
                    src="/rocket.gif"
                    alt="rocket"
                  />

                  <motion.div
                    animate={{ left: `calc(${progressPercentage}% + 36px)` }}
                    className="absolute top-1/2 -translate-y-1/2 flex items-center gap-2"
                    initial={{ left: "0%" }}

                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      animate={{ opacity: 1 }}
                      className="bg-black/70 px-3 py-1 rounded-full text-yellow-400 font-bold text-sm whitespace-nowrap"
                      initial={{ opacity: 0 }}
                    >
                      {WPM} WPM
                    </motion.div>

                  </motion.div>
                </>)}
              </div>
            </div>

            <Card className="mb-6 shadow-lg">
              <CardBody className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <Chip color={getDifficultyColor(difficulty)} variant="dot">
                    {capitalize(difficulty)}
                  </Chip>
                  <Button
                    color="warning"
                    size="sm"
                    variant="flat"
                    onPress={handleReset}
                  >
                    Reset
                  </Button>
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
                  autoFocus={true}
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
                />

                {phase === "game" && (
                  <div className="flex justify-between mt-4 text-sm text-default-500">
                    <span>
                      Progress: {currentIndex} / {words.length} words
                    </span>
                    <span>
                      Accuracy: {accuracy}%
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
