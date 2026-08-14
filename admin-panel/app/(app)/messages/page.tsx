import { getFacultyContext } from "@/lib/context";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import ComposeMessage from "./ComposeMessage";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const { session } = await getFacultyContext();

  const [received, sent, students] = await Promise.all([
    prisma.message.findMany({
      where: { recipientId: session.userId },
      include: { sender: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.message.findMany({
      where: { senderId: session.userId },
      include: { recipient: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.student.findMany({ include: { user: true }, orderBy: { studentId: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-500 mt-1">Direct communication with students</p>
      </div>

      <ComposeMessage
        students={students.map((s) => ({ userId: s.userId, name: s.user.name, studentId: s.studentId }))}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-slate-900 mb-4">Inbox ({received.length})</h2>
          {received.length === 0 ? (
            <p className="text-sm text-slate-500">No messages received yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {received.map((m) => (
                <li key={m.id} className="py-3">
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm font-medium text-slate-800">{m.sender.name}</p>
                    <p className="text-xs text-slate-400">{format(m.createdAt, "dd MMM, HH:mm")}</p>
                  </div>
                  {m.subject && <p className="text-sm font-medium text-slate-700 mt-0.5">{m.subject}</p>}
                  <p className="text-sm text-slate-500 mt-0.5">{m.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-slate-900 mb-4">Sent ({sent.length})</h2>
          {sent.length === 0 ? (
            <p className="text-sm text-slate-500">No messages sent yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {sent.map((m) => (
                <li key={m.id} className="py-3">
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm font-medium text-slate-800">To: {m.recipient.name}</p>
                    <p className="text-xs text-slate-400">{format(m.createdAt, "dd MMM, HH:mm")}</p>
                  </div>
                  {m.subject && <p className="text-sm font-medium text-slate-700 mt-0.5">{m.subject}</p>}
                  <p className="text-sm text-slate-500 mt-0.5">{m.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
