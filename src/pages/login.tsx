import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { title, subtitle } from "@/components/primitives";
import { loginUser, storeAuthToken, getAuthToken } from "@/api/auth";
import DefaultLayout from "@/layouts/default";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loggedIn = getAuthToken() !== null;

  if (loggedIn) {
    return <Navigate to="/dashboard" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please enter both username and password.");
      return;
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters long.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser({
        username,
        password,
      });

      // Store JWT token in localStorage
      storeAuthToken(response.token);

      // Show success toast
      toast.success("Login successful!");

      // Redirect to dashboard page
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background to-default-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="p-8 space-y-6 bg-background rounded-large shadow-medium">
            <div className="text-center space-y-2">
              <h1 className={title({ color: "blue", size: "sm" })}>Welcome Back</h1>
              <p className={subtitle({ fullWidth: true })}>Sign in to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                fullWidth
                autoComplete="username"
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                autoComplete="current-password"
              />

              <Button
                type="submit"
                color="primary"
                fullWidth
                isLoading={isLoading}
                className="mt-2"
              >
                Login
              </Button>
            </form>

            <div className="text-center mt-4">
              <p className="text-sm text-default-500">
                Don't have an account?{" "}
                <Link href="/signup" underline="hover" color="primary">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </DefaultLayout>
  );
}