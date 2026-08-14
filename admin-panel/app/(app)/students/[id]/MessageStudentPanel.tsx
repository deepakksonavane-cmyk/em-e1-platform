"use client";

import { useState } from "react";

export default function MessageStudentPanel({
  studentUserId,
  studentName,
}: {
  studentUserId: string;
  studentName: string;
}) {
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
      body: JSON.stringify({ recipientId: studentUserId, subject, message }),
    });
    setSending(false);
    if (res.ok) {
      setStatus("Message sent.");
      setSubject("");
      setMessage("");
    } else {
      setStatus("Failed to send message.");
    }
  }

  return (
    <div className="card">
      <h2 className="font-semibold text-slate-900 mb-4">Message {studentName}</h2>
      <form onSubmit={handleSend} className="space-y-3">
        <input
          className="input"
          placeholder="Subject (optional)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          className="input"
          rows={3}
          placeholder="Write a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <div className="flex items-center gap-3">
          <button type="submit" disabled={sending} className="btn-primary">
            {sending ? "Sending..." : "Send Message"}
          </button>
          {status && <span className="text-sm text-slate-500">{status}</span>}
        </div>
      </form>
    </div>
  );
}
