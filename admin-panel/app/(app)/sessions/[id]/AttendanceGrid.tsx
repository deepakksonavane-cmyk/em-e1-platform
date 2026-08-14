"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

interface StudentRow {
  id: string;
  studentId: string;
  name: string;
  email: string;
  currentStatus: Status | null;
}

const STATUS_OPTIONS: { value: Status; label: string; className: string }[] = [
  { value: "PRESENT", label: "Present", className: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  { value: "LATE", label: "Late", className: "bg-amber-100 text-amber-700 border-amber-300" },
  { value: "EXCUSED", label: "Excused", className: "bg-brand-100 text-brand-700 border-brand-300" },
  { value: "ABSENT", label: "Absent", className: "bg-red-100 text-red-700 border-red-300" },
];

export default function AttendanceGrid({
  sessionId,
  students,
  canEdit,
}: {
  sessionId: string;
  students: StudentRow[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, Status>>(
    Object.fromEntries(students.map((s) => [s.id, s.currentStatus || "PRESENT"]))
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function setAll(status: Status) {
    setValues(Object.fromEntries(students.map((s) => [s.id, status])));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const records = students.map((s) => ({ studentId: s.id, status: values[s.id] }));
    const res = await fetch(`/api/sessions/${sessionId}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage(`Saved attendance for ${students.length} students.`);
      router.refresh();
    } else {
      setMessage("Failed to save attendance.");
    }
  }

  const presentCount = Object.values(values).filter((v) => v === "PRESENT").length;

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">Attendance</h2>
          <p className="text-sm text-slate-500">
            {students.length} enrolled students · {presentCount} marked present
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <button onClick={() => setAll("PRESENT")} className="btn-outline !py-1.5 !px-3 text-xs">
              Mark all present
            </button>
            <button onClick={() => setAll("ABSENT")} className="btn-outline !py-1.5 !px-3 text-xs">
              Mark all absent
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td className="font-medium">{s.studentId}</td>
                <td>{s.name}</td>
                <td>
                  <div className="flex gap-1.5 flex-wrap">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={!canEdit}
                        onClick={() => setValues((v) => ({ ...v, [s.id]: opt.value }))}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          values[s.id] === opt.value
                            ? opt.className
                            : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canEdit && (
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Save Attendance"}
          </button>
          {message && <span className="text-sm text-slate-500">{message}</span>}
        </div>
      )}
    </div>
  );
}
