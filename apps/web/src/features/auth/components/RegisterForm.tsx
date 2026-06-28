"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import useRegister from "../hooks/useRegister";

const RegisterForm = () => {
  const { loading, error, handleRegister } =
    useRegister();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const onSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    await handleRegister(
      username,
      email,
      password
    );
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        placeholder="Username"
        value={username}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setUsername(e.target.value)
        }
      />

      <Input
        placeholder="Email"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setEmail(e.target.value)
        }
      />

      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setPassword(e.target.value)
        }
      />

      <Input
        placeholder="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setConfirmPassword(e.target.value)
        }
      />

      {error && (
        <p className="text-red-500">{error}</p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Loading..." : "Register"}
      </Button>
    </form>
  );
};

export default RegisterForm;