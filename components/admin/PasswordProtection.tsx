"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { QuickLink } from "../Link";
interface PasswordProtectionProps {
  children: React.ReactNode;
}

export function PasswordProtection({ children }: PasswordProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd want to store this in an env variable
    // and use proper authentication
    if (password === "andytheai") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-4xl">Admin Dashboard</h1>
      <p className="text-xl text-gray-600">
        Please enter the password to access the admin area
      </p>
      <form
        onSubmit={handleSubmit}
        className="mt-4 flex w-full max-w-sm flex-col gap-4"
      >
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border px-4 py-3 text-lg"
          placeholder="Enter password"
          required
        />
        {error && <p className="text-red-500">{error}</p>}

        <Button type="submit" asChild className="group mt-4">
          <QuickLink
            href="/"
            className="inline-flex items-center rounded-md bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
          >
            Log in
            <ArrowRight
              className="-me-1 ms-2 mt-0.5 transition-transform group-hover:translate-x-0.5"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
          </QuickLink>
        </Button>
      </form>
    </main>
  );
}
