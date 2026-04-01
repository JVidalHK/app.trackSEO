"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const domainParam = searchParams.get("domain") || "";

  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: name,
          pending_domain: domainParam,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setConfirmSent(true);
    setLoading(false);
  }

  async function handleGoogleSignup() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <svg width="32" height="32" viewBox="0 0 32 32">
            <defs><linearGradient id="lgS" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#06B6D4"/></linearGradient></defs>
            <rect width="32" height="32" rx="7" fill="url(#lgS)"/>
            <path d="M8 23L13.5 16.5L17 19.5L24 11" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 11L24 11L24 15" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xl font-medium">Track<span className="text-[#06B6D4] font-semibold">SEO</span></span>
        </div>

        <div className="bg-surface rounded-xl p-6 border border-border">
          <h1 className="text-lg font-medium mb-1">Create your account</h1>
          <p className="text-sm text-text-secondary mb-6">Start tracking your SEO today</p>

          {confirmSent ? (
            <div className="text-center py-4">
              <p className="text-accent font-medium mb-1">Check your email</p>
              <p className="text-sm text-text-secondary">
                We sent a confirmation link to {email}
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={handleGoogleSignup}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-border-light hover:bg-surface-hover text-sm font-medium transition-colors mb-4"
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M15.68 8.18c0-.57-.05-1.12-.14-1.64H8v3.1h4.3a3.68 3.68 0 01-1.6 2.42v2.01h2.58c1.51-1.39 2.38-3.44 2.38-5.89z" fill="#4285F4" />
                  <path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.59-2.01c-.72.48-1.63.76-2.71.76-2.09 0-3.86-1.41-4.49-3.31H.84v2.07A8 8 0 008 16z" fill="#34A853" />
                  <path d="M3.51 9.5A4.81 4.81 0 013.26 8c0-.52.09-1.03.25-1.5V4.43H.84A8 8 0 000 8c0 1.29.31 2.51.84 3.57l2.67-2.07z" fill="#FBBC05" />
                  <path d="M8 3.18c1.18 0 2.24.41 3.07 1.2l2.3-2.3A8 8 0 008 0 8 8 0 00.84 4.43l2.67 2.07C4.14 4.6 5.9 3.18 8 3.18z" fill="#EA4335" />
                </svg>
                Sign up with Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-text-tertiary">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form onSubmit={handleSignup} className="space-y-3">
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg bg-bg border border-border text-sm focus:border-accent focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg bg-bg border border-border text-sm focus:border-accent focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  className="w-full h-10 px-3 rounded-lg bg-bg border border-border text-sm focus:border-accent focus:outline-none"
                />

                {error && (
                  <p className="text-xs text-danger">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-lg bg-brand-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-text-secondary mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
