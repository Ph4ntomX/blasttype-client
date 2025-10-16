import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { Progress } from "@heroui/progress";
import toast from "react-hot-toast";

import { subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { getAuthToken } from "@/api/auth";
import { getUserData, UserData, isAdminUser } from "@/api/user";

// Helper function to get challenge type display name
const getChallengeTypeDisplay = (type: string) => {
    switch (type) {
        case "wpm": return "WPM";
        case "accuracy": return "Accuracy";
        case "games_played": return "Games Played";
        case "win": return "Wins";
        case "win_streak": return "Win Streak";
        default: return type;
    }
};

export default function DashboardPage() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [statsType, setStatsType] = useState<"multiplayer" | "solo">("multiplayer");

    const loggedIn = getAuthToken() !== null;
    if (!loggedIn) {
        return <Navigate to="/signup" />;
    }

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getUserData();
                setUserData(data);
            } catch (error) {
                /*removeAuthToken();
                navigate("/logout");*/

                navigate("/");

                toast.error("Failed to load user data.");
                console.error("Error fetching user data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Action button handlers
    const handleSoloPractice = () => navigate("/passages");
    const handleQuickPlay = () => navigate("/selection");

    // Get the current stats based on selected type
    const currentStats = statsType === "multiplayer"
        ? userData?.multiplayer_stats
        : userData?.solo_stats;

    if (isLoading) {
        return (
            <DefaultLayout>
                <div className="flex flex-col items-center justify-center min-h-[70vh]">
                    <Spinner size="lg" color="primary" />
                    <p className="mt-4 text-default-500">Loading your dashboard...</p>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Header Section */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold mb-2">
                                Welcome back, <span>{userData?.username || "Typist"}</span> 👋
                            </h1>
                            <p className={subtitle()}>Your typing journey continues.</p>
                        </div>
                        {userData && isAdminUser(userData) && (
                            <Button color="primary" onPress={() => navigate("/admin")}>Open Admin Dashboard</Button>
                        )}
                    </div>


                    {/* Stats Section with Toggle */}
                    <div className="mb-4">
                        <Tabs
                            aria-label="Stats Type"
                            selectedKey={statsType}
                            onSelectionChange={(key) => setStatsType(key as "multiplayer" | "solo")}
                            className="justify-center md:justify-start"
                        >
                            <Tab key="multiplayer" title="Multiplayer Stats" />
                            <Tab key="solo" title="Practice Stats" />
                        </Tabs>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {/* Best WPM Card */}
                        <Card className="border-none shadow-md">
                            <CardBody className="p-6 flex flex-col items-center">
                                <h3 className="text-cyan-500 font-semibold mb-2">Best WPM</h3>
                                <p className="text-4xl font-bold">{currentStats?.bestWPM || 0}</p>
                                <p className="text-default-500 text-sm mt-1">Words per minute</p>
                            </CardBody>
                        </Card>

                        {/* Average Accuracy Card */}
                        <Card className="border-none shadow-md">
                            <CardBody className="p-6 flex flex-col items-center">
                                <h3 className="text-pink-500 font-semibold mb-2">Average Accuracy</h3>
                                <p className="text-4xl font-bold">{currentStats?.avgAccuracy || 0}%</p>
                                <p className="text-default-500 text-sm mt-1">Typing precision</p>
                            </CardBody>
                        </Card>

                        {/* Games Played Card */}
                        <Card className="border-none shadow-md">
                            <CardBody className="p-6 flex flex-col items-center">
                                <h3 className="text-blue-500 font-semibold mb-2">Games Played</h3>
                                <p className="text-4xl font-bold">{currentStats?.gamesPlayed || 0}</p>
                                <p className="text-default-500 text-sm mt-1">Total races</p>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Challenges Progress Section */}
                    <motion.div
                        className="mb-10 p-6 rounded-xl dark:bg-neutral-900 bg-neutral-100 shadow-lg"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        whileHover={{ scale: 1.01 }}
                    >
                        <h2 className="text-xl font-bold mb-5">Your Challenges</h2>

                        {userData?.daily_challenge && (
                            <motion.div
                                className="mb-8"
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex flex-col">
                                        <span className="text-md font-medium">
                                            Daily: {userData.daily_challenge.goal}
                                        </span>
                                        <span className="text-sm text-default-500">
                                            Expires on {new Date(userData.daily_challenge.expiresAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <span className="text-md font-medium">
                                        {userData.daily_challenge.currentValue} / {userData.daily_challenge.targetValue} {getChallengeTypeDisplay(userData.daily_challenge.type)}
                                        {userData.daily_challenge.completed && " ✓"}
                                    </span>
                                </div>
                                <Progress
                                    value={Math.min(100, (userData.daily_challenge.currentValue / userData.daily_challenge.targetValue) * 100)}
                                    color={userData.daily_challenge.completed ? "success" : "primary"}
                                    className="h-2"
                                    aria-label="Daily challenge progress"
                                    size="lg"
                                />
                            </motion.div>
                        )}

                        {userData?.weekly_challenge && (
                            <motion.div
                                className="mb-8"
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex flex-col">
                                        <span className="text-md font-medium">
                                            Weekly: {userData.weekly_challenge.goal}
                                        </span>
                                        <span className="text-sm text-default-500">
                                            Expires on {new Date(userData.weekly_challenge.expiresAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <span className="text-md font-medium">
                                        {userData.weekly_challenge.currentValue} / {userData.weekly_challenge.targetValue} {getChallengeTypeDisplay(userData.weekly_challenge.type)}
                                        {userData.weekly_challenge.completed && " ✓"}
                                    </span>
                                </div>
                                <Progress
                                    value={Math.min(100, (userData.weekly_challenge.currentValue / userData.weekly_challenge.targetValue) * 100)}
                                    color={userData.weekly_challenge.completed ? "success" : "secondary"}
                                    className="h-2"
                                    aria-label="Weekly challenge progress"
                                    size="lg"
                                />
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-6">
                        {/* Two Half-Width Buttons Below */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Quick Play Button - Full Width */}
                            <motion.div
                                className="w-full rounded-xl overflow-hidden shadow-lg relative dark:bg-neutral-900 bg-neutral-200"
                                whileHover={{ scale: 1.01 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div
                                    className="p-6 h-48 flex flex-col justify-between bg-cover bg-center"
                                >
                                    <div>
                                        <h3 className="dark:text-white text-black text-2xl font-bold mb-2">Quick Play Queue</h3>
                                        <p className="dark:text-neutral-200 text-neutral-900 mb-4">Race up to 5 players in real-time battles.</p>
                                    </div>
                                    <Button
                                        className="bg-neutral-950 text-green-600 hover:text-green-50 font-bold py-2 px-6 rounded-lg self-start"
                                        onPress={handleQuickPlay}
                                    >
                                        Start Racing
                                    </Button>
                                </div>
                            </motion.div>

                            {/* Solo Practice Button */}
                            <motion.div
                                className="rounded-xl overflow-hidden shadow-lg relative dark:bg-neutral-900 bg-neutral-200"
                                whileHover={{ scale: 1.01 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div
                                    className="p-6 h-48 flex flex-col justify-between bg-cover bg-center"
                                >
                                    <div>
                                        <h3 className="dark:text-white text-black text-2xl font-bold mb-2">Solo Practice</h3>
                                        <p className="dark:text-neutral-200 text-neutral-900 mb-4">Warm up with any passage at your own pace. (Challenges do not apply for practice mode)</p>
                                    </div>
                                    <Button
                                        className="bg-neutral-950 text-yellow-600 hover:text-yellow-50 font-bold py-2 px-6 rounded-lg self-start"
                                        onPress={handleSoloPractice}
                                    >
                                        Start Practice
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </DefaultLayout>
    );
}
