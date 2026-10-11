"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Lock, Mail, User, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-eco-950 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-eco-500/25 space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-eco-600 to-cyan-400 p-0.5 mx-auto mb-3">
            <div className="w-full h-full bg-eco-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-eco-400 animate-pulse-subtle" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Operator Account</h2>
          <p className="text-xs text-eco-200/60 mt-1">
            Register to control photobioreactor telemetry & access AI reports
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-eco-300 font-medium block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-eco-400/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Jane Doe"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-eco-950 border border-eco-500/25 text-white placeholder-eco-300/40 focus:outline-none focus:border-eco-400/60"
              />
            </div>
          </div>

          <div>
            <label className="text-eco-300 font-medium block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-eco-400/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@microalgae.org"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-eco-950 border border-eco-500/25 text-white placeholder-eco-300/40 focus:outline-none focus:border-eco-400/60"
              />
            </div>
          </div>

          <div>
            <label className="text-eco-300 font-medium block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-eco-400/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-eco-950 border border-eco-500/25 text-white placeholder-eco-300/40 focus:outline-none focus:border-eco-400/60"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>REGISTER OPERATOR</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-eco-300/60">
          Already registered?{" "}
          <Link href="/login" className="text-eco-400 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
