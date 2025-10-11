import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import toast from "react-hot-toast";

import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { getAuthToken, removeAuthToken } from "@/api/auth";
import { getUserData, UserData, UserStats } from "@/api/user";

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
    const handleQuickPlay = () => navigate("/queue");
    const handleChallenges = () => navigate("/challenges");

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
                    <div className="mb-8 text-center md:text-left">
                        <h1 className="text-3xl font-bold mb-2">
                            Welcome back, <span>{userData?.username || "Typist"}</span> 👋
                        </h1>
                        <p className={subtitle()}>Your typing journey continues.</p>
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

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-6">
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

                        {/* Two Half-Width Buttons Below */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        <p className="dark:text-neutral-200 text-neutral-900 mb-4">Warm up with any passage at your own pace.</p>
                                    </div>
                                    <Button 
                                        className="bg-neutral-950 text-yellow-600 hover:text-yellow-50 font-bold py-2 px-6 rounded-lg self-start"
                                        onPress={handleSoloPractice}
                                    >
                                        Start Practice
                                    </Button>
                                </div>
                            </motion.div>

                            {/* Challenges Button */}
                            <motion.div
                                className="rounded-xl overflow-hidden shadow-lg relative dark:bg-neutral-900 bg-neutral-200"
                                whileHover={{ scale: 1.01 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div 
                                    className="p-6 h-48 flex flex-col justify-between bg-cover bg-center"
                                >
                                    <div>
                                        <h3 className="dark:text-white text-black text-2xl font-bold mb-2">Challenges</h3>
                                        <p className="dark:text-neutral-200 text-neutral-900 mb-4">Complete daily and weekly goals for rewards.</p>
                                    </div>
                                    <Button 
                                        className="bg-neutral-950 text-pink-600 hover:text-pink-50 font-bold py-2 px-6 rounded-lg self-start"
                                        onPress={handleChallenges}
                                    >
                                        View Challenges
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
