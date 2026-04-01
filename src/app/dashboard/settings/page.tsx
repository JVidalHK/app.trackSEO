"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || "");
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (data) setName(data.full_name || "");
    }
    load();
  }, [supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name })
      .eq("id", user.id);

    if (error) {
      setMessage("Failed to save: " + error.message);
    } else {
      setMessage("Saved successfully");
    }
    setSaving(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push(process.env.NEXT_PUBLIC_MARKETING_URL || "/");
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-medium mb-5">Settings</h1>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-xs text-text-secondary block mb-1">Display name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-sm focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-text-secondary block mb-1">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-sm text-text-secondary"
          />
          <p className="text-[10px] text-text-tertiary mt-1">
            Contact support to change your email
          </p>
        </div>

        {message && (
          <p className={`text-xs ${message.includes("Failed") ? "text-danger" : "text-accent"}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="h-9 px-4 rounded-lg bg-brand-gradient text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-border">
        <button
          onClick={handleLogout}
          className="text-sm text-danger hover:underline"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
