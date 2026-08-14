"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ComposeMessage({
  students,
}: {
  students: { userId: string; name: string; studentId: string }[];
}) {
  const router = useRouter();
  const [recipientId, setRecipientId] = useState(students[0]?.userId || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setStatus("");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId, subject, message }),
    });
    setSending(false);
    if (res.ok) {
      setStatus("Message sent.");
      setSubject("");
      setMessage("");
      router.refresh();
    } else {
      setStatus("Failed to send message.");
    }
  }

  return (
    <form onSubmit={handleSend} className="card space-y-3">
      <h2 className="font-semibold text-slate-900">Compose Message</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select className="input sm:col-span-1" value={recipientId} onChange={(e) => setRecipientId(e.target.value)}>
          {students.map((s) => (
            <option key={s.userId} value={s.userId}>
              {s.studentId} — {s.name}
            </option>
          ))}
        </select>
        <input
          className="input sm:col-span-2"
          placeholder="Subject (optional)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <textarea
        className="input"
        rows={3}
        placeholder="Write a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={sending || !recipientId} className="btn-primary">
          {sending ? "Sending..." : "Send"}
        </button>
        {status && <span className="text-sm text-slate-500">{status}</span>}
      </div>
    </form>
  );
}
