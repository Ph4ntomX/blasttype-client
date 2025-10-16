import { motion } from "framer-motion";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { useNavigate } from "react-router-dom";

import DefaultLayout from "@/layouts/default";
import { title, subtitle } from "@/components/primitives";
import { useEffect, useState } from "react";
import { getUserData } from "@/api/user";
import { isAdminUser } from "@/api/user";
import toast from "react-hot-toast";

export default function GameSelectionPage() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // check admin

    getUserData().then((userData) => {
      if (!isAdminUser(userData)) {
        toast.error("You do not have permission to access this page.");
        navigate("/dashboard");
      }
      setIsLoading(false);
    }).catch(() => {
      toast.error("Failed to load user data. Please try again.");
      navigate("/signup");
    });
  }, [navigate]);

  const tiles = [
    {
      key: "manage-passages",
      title: "Manage Passages",
      desc: "Add, remove, and update passages.",
      buttonClass: "bg-green-500 hover:bg-green-600 text-white",
    },
    {
      key: "manage-users",
      title: "Manage Users",
      desc: "Manage user accounts and permissions.",
      buttonClass: "bg-blue-500 hover:bg-blue-600 text-white",
    },
    {
      key: "manage-challenges",
      title: "Manage Challenges",
      desc: "Manage challenge settings and types.",
      buttonClass: "bg-pink-500 hover:bg-pink-600 text-white",
    },
  ] as const;

  if (!isLoading) {
    return null;
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8 text-center">
            <h1 className={title({ size: "sm" })}>Choose Your Queue</h1>
            <p className={subtitle()}>Select a difficulty to play against others</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiles.map((t) => (
              <motion.div
                key={t.key}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full shadow-lg">
                  <CardBody className="p-6 flex flex-col items-center text-center gap-3">
                    <h3 className="text-2xl font-bold">{t.title}</h3>
                    <p className="text-default-500 mb-3">{t.desc}</p>
                    <Button
                      className={`${t.buttonClass} font-semibold px-6`}
                      onPress={() => navigate(`/admin/${t.key}`)}
                    >
                      Join {t.title} Queue
                    </Button>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button variant="flat" onPress={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        </motion.div>
      </div>
    </DefaultLayout>
  );
}