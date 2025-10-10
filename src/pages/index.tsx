import { Button } from "@heroui/button";
import { button as buttonStyles } from "@heroui/theme";
import { useNavigate } from "react-router-dom";

import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

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

        <div className="inline-block max-w-3xl text-center justify-center px-4">
          <h1 className={title({ size: "lg" })}>
            <span className={title({ color: "yellow", size: "lg" })}>
              BlastType
            </span>
          </h1>
          <h2 className={title({ size: "md" })} style={{ marginTop: "1rem" }}>
            Race. Type. Improve.
          </h2>
          <p className={subtitle({ fullWidth: true })} style={{ marginTop: "1.5rem" }}>
            Test your typing skills in real-time multiplayer or solo practice.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button
            className={buttonStyles({
              color: "primary",
              radius: "full",
              variant: "shadow",
              size: "lg",
            })}
            onPress={() => navigate("/login")}
            style={{
              transition: "transform 0.2s ease",
              minWidth: "160px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
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
            style={{
              transition: "transform 0.2s ease",
              minWidth: "160px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Learn More
          </Button>
        </div>
      </section>

      <section id="features" className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className={title({ size: "md" })} style={{ textAlign: "center", marginBottom: "3rem" }}>
            Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">🕹️</div>
              <h4 className="text-xl font-semibold mb-2">Quick Play Queue</h4>
              <p className="text-default-600">
                Join multiplayer races instantly and compete with typists from around the world.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">✍️</div>
              <h4 className="text-xl font-semibold mb-2">Solo Practice</h4>
              <p className="text-default-600">
                Train with curated passages and improve your speed and accuracy at your own pace.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="text-xl font-semibold mb-2">Challenges</h4>
              <p className="text-default-600">
                Earn rewards for hitting goals and unlock achievements as you progress.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">💾</div>
              <h4 className="text-xl font-semibold mb-2">Player Profiles</h4>
              <p className="text-default-600">
                Track your stats, view your history, and watch your typing skills grow over time.
              </p>
            </div>
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
