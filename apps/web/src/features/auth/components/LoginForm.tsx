"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import useAuth from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";

const LoginForm = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-slide-up">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="mt-2 text-surface-400">Enter the arena.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        />

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-brand-400 hover:text-brand-300 transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;