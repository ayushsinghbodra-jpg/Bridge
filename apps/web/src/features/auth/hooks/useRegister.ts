"use client";

import { useState } from "react";
import { register } from "@/services/api/auth.service";

const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      setLoading(true);
      setError("");

      const data = await register(
        username,
        email,
        password
      );

      return data;
    } catch (err) {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleRegister,
  };
};

export default useRegister;