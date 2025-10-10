import { Button } from "@heroui/button";
import { button as buttonStyles } from "@heroui/theme";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

const GamepadIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 11H8M7 10V12M15.5 11H15.51M18.5 11H18.51M7 18C4.23858 18 2 15.7614 2 13C2 10.2386 4.23858 8 7 8H17C19.7614 8 22 10.2386 22 13C22 15.7614 19.7614 18 17 18H13L12.7071 18.2929C11.6416 19.3584 9.85786 19.3584 8.79289 18.2929L8.5 18H7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PencilIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20H21M16.5 3.50001C16.8978 3.10219 17.4374 2.87869 18 2.87869C18.2786 2.87869 18.5544 2.93356 18.8118 3.04017C19.0692 3.14677 19.303 3.30303 19.5 3.50001C19.697 3.697 19.8532 3.93085 19.9598 4.18822C20.0665 4.44559 20.1213 4.72144 20.1213 5.00001C20.1213 5.27858 20.0665 5.55444 19.9598 5.81181C19.8532 6.06918 19.697 6.30303 19.5 6.50001L7 19L3 20L4 16L16.5 3.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TargetIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  </svg>
);

const ChartIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3V21H21M7 16L12 11L16 15L21 10M21 10V14M21 10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    featuresSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <DefaultLayout>
      <section className="relative flex flex-col items-center justify-center gap-4 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-pink-500/20 to-cyan-500/20 dark:from-orange-600/10 dark:via-pink-600/10 dark:to-cyan-600/10 -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.2),rgba(0,0,0,0))] -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block max-w-3xl text-center justify-center px-4"
        >
          <div className="mb-8">
            <h1 className={title({ size: "lg" })}>
              <span className={title({ color: "yellow", size: "lg" })}>
                BlastType
              </span>
            </h1>
          </div>
          <div className="mb-6">
            <h2 className={title({ color: "cyan", size: "lg" })}>
              Race. Type. Improve.
            </h2>
          </div>
          <p className={subtitle({ fullWidth: true })}>
            Test your typing skills in real-time multiplayer or solo practice.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mt-4"
        >
          <Button
            className={buttonStyles({
              color: "primary",
              radius: "full",
              variant: "shadow",
              size: "lg",
            })}
            onPress={() => navigate("/login")}
            as={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </Button>
          <Button
            className={buttonStyles({
              variant: "bordered",
              radius: "full",
              size: "lg"
            })}
            onPress={scrollToFeatures}
            as={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Learn More
          </Button>
        </motion.div>
      </section>

      <section id="features" className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className={title({ size: "md" })}>Features</h3>
            <p className={subtitle({ className: "mt-4" })}>
              Everything you need to become a typing champion
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300"
            >
              <div className="text-orange-500 mb-4">
                <GamepadIcon />
              </div>
              <h4 className="text-xl font-semibold mb-2">Quick Play Queue</h4>
              <p className="text-default-600">
                Join multiplayer races instantly and compete with typists from around the world.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300"
            >
              <div className="text-pink-500 mb-4">
                <PencilIcon />
              </div>
              <h4 className="text-xl font-semibold mb-2">Solo Practice</h4>
              <p className="text-default-600">
                Train with curated passages and improve your speed and accuracy at your own pace.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300"
            >
              <div className="text-cyan-500 mb-4">
                <TargetIcon />
              </div>
              <h4 className="text-xl font-semibold mb-2">Challenges</h4>
              <p className="text-default-600">
                Earn rewards for hitting goals and unlock achievements as you progress.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-all duration-300"
            >
              <div className="text-green-500 mb-4">
                <ChartIcon />
              </div>
              <h4 className="text-xl font-semibold mb-2">Player Profiles</h4>
              <p className="text-default-600">
                Track your stats, view your history, and watch your typing skills grow over time.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-default-200">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-default-600">
            © 2025 BlastType. All rights reserved.
          </p>
        </div>
      </footer>
    </DefaultLayout>
  );
}
