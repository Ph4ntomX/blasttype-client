import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { title, subtitle } from "@/components/primitives";
import { registerUser, storeAuthToken, getAuthToken } from "@/api/auth";
import DefaultLayout from "@/layouts/default";

export default function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loggedIn = getAuthToken() !== null;
  if (loggedIn) {
    return <Navigate to="/dashboard" />;
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await registerUser({
        username,
        email,
        password,
      });

      // Store JWT token in localStorage
      storeAuthToken(response.token);

      // Show success toast
      toast.success("Account created successfully!");

      // Redirect to dashboard page
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center min-h-screen p-4 bg-gradient-to-br from-background to-default-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mt-40"
        >
          <div className="p-8 space-y-6 bg-background rounded-large shadow-medium">
            <div className="text-center space-y-2">
              <h1 className={title({ color: "green", size: "sm" })}>Welcome to BlastType</h1>
              <p className={subtitle({ fullWidth: true })}>Create your account</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <Input
                label="Username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                fullWidth
                autoComplete="username"
              />

              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                autoComplete="email"
              />

              <Input
                label="Password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                autoComplete="new-password"
              />

              <Button
                type="submit"
                color="primary"
                fullWidth
                isLoading={isLoading}
                className="mt-2"
              >
                Create Account
              </Button>
            </form>

            <div className="text-center mt-4">
              <p className="text-sm text-default-500">
                Already have an account?{" "}
                <Link href="/login" underline="hover" color="primary">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </DefaultLayout>
  );
}