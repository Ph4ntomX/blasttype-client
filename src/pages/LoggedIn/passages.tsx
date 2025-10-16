import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Spinner } from "@heroui/spinner";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import toast from "react-hot-toast";

import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { getPassages, getRandomPassage, Passage } from "@/api/passage";
import { getAuthToken } from "@/api/auth";

export default function PassageBrowserPage() {
  const navigate = useNavigate();
  const [filteredPassages, setFilteredPassages] = useState<Passage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

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

  // Using Select component for difficulty filter, no button label needed

  const loggedIn = getAuthToken() !== null;
    if (!loggedIn) {
        return <Navigate to="/signup" />;
  }

  useEffect(() => {
    const fetchPassages = async () => {
      try {
        const data = await getPassages();
        setFilteredPassages(data);
      } catch (error) {
        toast.error("Failed to load passages. Please try again.");
        console.error("Error fetching passages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPassages();
  }, []);

  // Filter passages when search or difficulty changes
  useEffect(() => {
    const fetchFilteredPassages = async () => {
      try {
        const data = await getPassages(
          searchQuery || undefined,
          selectedDifficulty === "all" ? undefined : selectedDifficulty
        );
        setFilteredPassages(data);
      } catch (error) {
        toast.error("Failed to filter passages. Please try again.");
        console.error("Error filtering passages:", error);
      }
    };

    fetchFilteredPassages();
  }, [searchQuery, selectedDifficulty]);

  // Handle random passage selection
  const handleRandomPassage = async (difficulty: string) => {
    try {
      setIsLoading(true);
      const randomPassage = await getRandomPassage(difficulty);
      navigate(`/practice/${randomPassage._id}`);
    } catch (error) {
      toast.error(`Failed to get a random ${difficulty} passage. Please try again.`);
      console.error("Error getting random passage:", error);
      setIsLoading(false);
    }
  };

  // Get button color based on difficulty
  const getDifficultyButtonClass = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "medium":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case "hard":
        return "bg-pink-500 hover:bg-pink-600 text-white";
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white";
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div>
              <h1 className={title({ size: "sm" })}>Choose Your Passage 🚀</h1>
              <p className={subtitle()}>Warm up with any passage, or try a random one by difficulty.</p>
            </div>

            {/* Random Passage Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
              <Button
                size="md"
                className={getDifficultyButtonClass("easy")}
                onPress={() => handleRandomPassage("easy")}
              >
                Random Easy
              </Button>

              <div className="flex flex-row gap-2">

                <Button
                  size="md"
                  className={getDifficultyButtonClass("medium")}
                  onPress={() => handleRandomPassage("medium")}
                >
                  Random Medium
                </Button>

                <Button
                  size="md"
                  className={getDifficultyButtonClass("hard")}
                  onPress={() => handleRandomPassage("hard")}
                >
                  Random Hard
                </Button>
              </div>


            </div>
          </div>

          {/* Filters Section */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Input
              type="text"
              label="Search passages"
              placeholder="Type to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />

            <Select
              label="Difficulty"
              selectedKeys={new Set([selectedDifficulty])}
              onSelectionChange={(keys) => setSelectedDifficulty(Array.from(keys)[0] as string)}
              className="max-w-xs"
            >
              <SelectItem key="all">All</SelectItem>
              <SelectItem key="easy">Easy</SelectItem>
              <SelectItem key="medium">Medium</SelectItem>
              <SelectItem key="hard">Hard</SelectItem>
            </Select>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner size="lg" color="primary" />
              <p className="mt-4 text-default-500">Loading passages...</p>
            </div>
          )}

          {/* No Results State */}
          {!isLoading && filteredPassages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl">No passages found.</p>
              <p className="text-default-500 mt-2">Try adjusting your search or filters.</p>
            </div>
          )}

          {/* Passages Grid */}
          {!isLoading && filteredPassages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPassages.map((passage) => (
                <motion.div
                  key={passage._id}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="h-full">
                    <CardBody className="pb-2">
                      <div className="flex justify-end items-start mb-2">
                        <Chip color={getDifficultyColor(passage.difficulty)} variant="dot">
                          {capitalize(passage.difficulty)}
                        </Chip>
                      </div>
                      <p className="text-default-500">
                        {passage.text.length > 50
                          ? `${passage.text.substring(0, 50)}... (${passage.text.length})`
                          : passage.text}
                      </p>
                    </CardBody>
                    <CardFooter>
                      <Button
                        color="primary"
                        onPress={() => navigate(`/practice/${passage._id}`)}
                      >
                        Start Practice
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DefaultLayout>
  );
}