"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

const ResetPassword = () => {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: any) => {
    try {
      e.preventDefault();
        
      if (password !== confirmPassword) {
        setPassword("");
        setConfirmPassword("");
        alert("Passwords do not match!");
        return;
      }

      const res = await fetch("/api/forgot-password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok && res.status !== 200) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to reset password");
      }

      const data = await res.json();
      if (data.error) {
        setPassword("");
        setConfirmPassword("");
        throw new Error(data.error);
      }
      alert(data.message || "Password reset successful!");
      router.push("/login");
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Failed to reset password. " + error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Reset Password</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="new-password">
            New Password
          </label>
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            id="new-password"
            className="border border-gray-100 py-2 px-3 rounded w-full outline-gray-200"
            placeholder="Enter your new password"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-password">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            id="confirm-password"
            className="border border-gray-100 py-2 px-3 rounded w-full outline-gray-200"
            placeholder="Confirm your new password"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;