"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SessionEditForm({ session, canEdit }: { session: any; canEdit: boolean }) {
  const router = useRouter();
  const [meetingLink, setMeetingLink] = useState(session.meetingLink || "");
  const [status, setStatus] = useState(session.status);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingLink, status }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Saved.");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || "Failed to save.");
    }
  }

  return (
    <form onSubmit={handleSave} className="card space-y-4">
      <h2 className="font-semibold text-slate-900">Session Settings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Meeting Link</label>
          <input
            className="input"
            placeholder="https://meet.google.com/..."
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} disabled={!canEdit}>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      {canEdit && (
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {message && <span className="text-sm text-slate-500">{message}</span>}
        </div>
      )}
    </form>
  );
}
