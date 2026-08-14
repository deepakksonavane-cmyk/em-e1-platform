import { requireStudent } from "@/lib/student";
import { query } from "@/lib/db";
import { Card, CardHeader } from "@/components/Card";
import { sendMessageAction } from "@/lib/actions";
import type { Message } from "@/lib/types";
import { format } from "date-fns";

interface MessageRow extends Message {
  senderName: string;
  recipientName: string;
}

interface FacultyOption {
  userId: string;
  name: string;
  subjectName: string | null;
}

export default async function MessagesPage() {
  const student = await requireStudent();

  const [messages, facultyOptions] = await Promise.all([
    query<MessageRow>(
      `SELECT m.*, su.name AS "senderName", ru.name AS "recipientName"
       FROM "Message" m
       JOIN "User" su ON su.id = m."senderId"
       JOIN "User" ru ON ru.id = m."recipientId"
       WHERE m."senderId" = $1 OR m."recipientId" = $1
       ORDER BY m."createdAt" DESC`,
      [student.user.id]
    ),
    query<FacultyOption>(
      `SELECT u.id AS "userId", u.name, sub.name AS "subjectName"
       FROM "Faculty" f
       JOIN "User" u ON u.id = f."userId"
       LEFT JOIN "Subject" sub ON sub."lecturerId" = f.id
       ORDER BY u.name ASC`
    ),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-500 text-sm mt-1">Message your faculty directly.</p>
      </div>

      <Card>
        <CardHeader title="Send a Message" />
        <form action={sendMessageAction} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
            <select
              name="recipientId"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select faculty...</option>
              {facultyOptions.map((f) => (
                <option key={f.userId} value={f.userId}>
                  {f.name} {f.subjectName ? `(${f.subjectName})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
            <input name="subject" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
            <textarea
              name="body"
              rows={4}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md px-4 py-2">
            Send
          </button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Inbox" subtitle="Sent and received messages" />
        {messages.length === 0 ? (
          <p className="text-sm text-slate-400">No messages yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {messages.map((m) => {
              const isOutgoing = m.senderId === student.user.id;
              return (
                <li key={m.id} className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800">
                      {isOutgoing ? `To: ${m.recipientName}` : `From: ${m.senderName}`}
                      {m.subject ? ` — ${m.subject}` : ""}
                    </p>
                    <p className="text-xs text-slate-400 whitespace-nowrap">
                      {format(new Date(m.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{m.body}</p>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
