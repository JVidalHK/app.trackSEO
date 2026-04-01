"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMessage, setPwMessage] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || "");
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
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
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", user.id);
    setMessage(error ? "Failed to save: " + error.message : "Saved successfully");
    setSaving(false);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwMessage("");
    if (newPassword.length < 6) { setPwMessage("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setPwMessage("Passwords don't match"); return; }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwMessage(error ? "Failed: " + error.message : "Password updated successfully");
    if (!error) { setNewPassword(""); setConfirmPassword(""); }
    setPwSaving(false);
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (res.ok) {
        await supabase.auth.signOut();
        window.location.href = process.env.NEXT_PUBLIC_MARKETING_URL || "/";
      } else {
        const data = await res.json();
        alert("Failed to delete account: " + (data.error || "Unknown error"));
      }
    } catch {
      alert("Failed to delete account. Please try again.");
    }
    setDeleting(false);
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-medium mb-5">Settings</h1>

      {/* Display name */}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-xs text-text-secondary block mb-1">Display name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-sm focus:border-accent focus:outline-none" />
        </div>
        <div>
          <label className="text-xs text-text-secondary block mb-1">Email</label>
          <input type="email" value={email} disabled
            className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-sm text-text-secondary" />
          <p className="text-[10px] text-text-tertiary mt-1">Contact support to change your email</p>
        </div>
        {message && <p className={`text-xs ${message.includes("Failed") ? "text-danger" : "text-success"}`}>{message}</p>}
        <button type="submit" disabled={saving}
          className="h-9 px-4 rounded-lg bg-brand-gradient text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      {/* Update password */}
      <div className="mt-8 pt-6 border-t border-border">
        <h2 className="text-sm font-medium mb-3">Update password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="text-xs text-text-secondary block mb-1">New password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required
              className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-sm focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-text-secondary block mb-1">Confirm password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required
              className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-sm focus:border-accent focus:outline-none" />
          </div>
          {pwMessage && <p className={`text-xs ${pwMessage.includes("Failed") ? "text-danger" : "text-success"}`}>{pwMessage}</p>}
          <button type="submit" disabled={pwSaving}
            className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-surface-hover disabled:opacity-50">
            {pwSaving ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>

      {/* Delete account */}
      <div className="mt-8 pt-6 border-t border-danger/20">
        <h2 className="text-sm font-medium text-danger mb-2">Delete account</h2>
        <p className="text-xs text-text-secondary mb-3 leading-relaxed">
          This will permanently delete your account, all reports, credits, progress data, and all associated information. This action cannot be undone.
        </p>
        <button onClick={() => setShowDeleteModal(true)}
          className="h-9 px-4 rounded-lg border border-danger text-danger text-sm font-medium hover:bg-danger/5">
          Delete account
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-surface border border-border rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-base font-medium mb-2">Delete your account?</h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              This action is permanent and cannot be reversed. All your reports, credits, progress data, and account information will be permanently deleted.
            </p>
            <div className="mb-4">
              <label className="text-xs text-text-secondary block mb-1">
                Type <span className="font-mono font-medium text-text-primary">DELETE</span> to confirm
              </label>
              <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-bg border border-border text-sm focus:border-danger focus:outline-none"
                placeholder="DELETE" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}
                className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-surface-hover">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} disabled={deleteConfirm !== "DELETE" || deleting}
                className="h-9 px-4 rounded-lg bg-danger text-white text-sm font-medium hover:opacity-90 disabled:opacity-40">
                {deleting ? "Deleting..." : "Delete my account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
