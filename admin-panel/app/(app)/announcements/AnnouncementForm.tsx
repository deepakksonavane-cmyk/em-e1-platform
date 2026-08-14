"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AnnouncementForm({ batches }: { batches: string[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [batch, setBatch] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setStatus("");
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message, batch: batch || undefined }),
    });
    const data = await res.json();
    setSending(false);
    if (res.ok) {
      setStatus(`Sent to ${data.recipients} students.`);
      setTitle("");
      setMessage("");
      router.refresh();
    } else {
      setStatus(data.error || "Failed to send announcement.");
    }
  }

  return (
    <form onSubmit={handleSend} className="card space-y-3">
      <h2 className="font-semibold text-slate-900">New Announcement</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          className="input sm:col-span-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <select className="input" value={batch} onChange={(e) => setBatch(e.target.value)}>
          <option value="">All batches</option>
          {batches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
      <textarea
        className="input"
        rows={3}
        placeholder="Announcement message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={sending} className="btn-primary">
          {sending ? "Sending..." : "Broadcast to Students"}
        </button>
        {status && <span className="text-sm text-slate-500">{status}</span>}
      </div>
    </form>
  );
}
