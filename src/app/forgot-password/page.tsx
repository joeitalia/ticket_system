"use client";
import { sendResetEmail } from "@/util/send-email";
import Link from "next/link";
import { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res) throw new Error(res);
      console.log(res);
      const resetLinkData = await res.json();
      console.log(resetLinkData);
      await sendResetEmail(email, resetLinkData.resetLink);
      alert("If email exists, reset link has been sent.");
      setEmail("");
    } catch (error) {
      alert("Error sending reset link:" + error);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Forgot Password</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            className="border border-gray-100 py-2 px-3 rounded w-full outline-gray-200"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer"
        >
          Reset Password
        </button>
        <Link href="/login" className="block text-sm text-blue-700 hover:underline mt-4">
          Back to Login
        </Link>
      </form>
    </div>
  );
};

export default ForgotPassword;