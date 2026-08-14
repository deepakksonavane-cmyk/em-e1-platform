"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface Row {
  submissionId: string | null;
  studentId: string;
  studentCode: string;
  studentName: string;
  status: string;
  score: number | null;
  feedback: string;
  fileUrl: string | null;
  textContent: string | null;
  submittedAt: string | Date | null;
}

const STATUS_STYLES: Record<string, string> = {
  NOT_SUBMITTED: "bg-slate-100 text-slate-500",
  SUBMITTED: "bg-amber-100 text-amber-700",
  LATE: "bg-orange-100 text-orange-700",
  GRADED: "bg-emerald-100 text-emerald-700",
  RETURNED: "bg-brand-100 text-brand-700",
};

export default function SubmissionsTable({
  assessmentId,
  maxScore,
  rows,
}: {
  assessmentId: string;
  maxScore: number;
  rows: Row[];
}) {
  const router = useRouter();
  const [ungradedFirst, setUngradedFirst] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sortedRows = useMemo(() => {
    if (!ungradedFirst) return rows;
    const rank = (s: string) =>
      s === "SUBMITTED" || s === "LATE" ? 0 : s === "NOT_SUBMITTED" ? 1 : 2;
    return [...rows].sort((a, b) => rank(a.status) - rank(b.status));
  }, [rows, ungradedFirst]);

  function openGrading(row: Row) {
    setOpenId(row.submissionId);
    setScore(row.score !== null ? String(row.score) : "");
    setFeedback(row.feedback || "");
    setError("");
  }

  async function submitGrade() {
    if (!openId) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/submissions/${openId}/grade`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: Number(score), feedback }),
    });
    setSaving(false);
    if (res.ok) {
      setOpenId(null);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to save grade.");
    }
  }

  const activeRow = rows.find((r) => r.submissionId === openId);

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold text-slate-900">Submissions ({rows.length})</h2>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={ungradedFirst}
            onChange={(e) => setUngradedFirst(e.target.checked)}
          />
          Ungraded first
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Score</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((r) => (
              <tr key={r.studentId}>
                <td>
                  <p className="font-medium">{r.studentName}</p>
                  <p className="text-xs text-slate-400">{r.studentCode}</p>
                </td>
                <td>
                  <span className={`badge ${STATUS_STYLES[r.status]}`}>{r.status.replace("_", " ")}</span>
                </td>
                <td>{r.submittedAt ? format(new Date(r.submittedAt), "dd MMM yyyy") : "—"}</td>
                <td>{r.score !== null ? `${r.score}/${maxScore}` : "—"}</td>
                <td>
                  {r.submissionId && r.status !== "NOT_SUBMITTED" ? (
                    <button
                      onClick={() => openGrading(r)}
                      className="text-brand-600 hover:underline text-sm font-medium"
                    >
                      {r.status === "GRADED" ? "Edit grade" : "Grade"}
                    </button>
                  ) : (
                    <span className="text-slate-300 text-sm">No submission</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openId && activeRow && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setOpenId(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <h3 className="font-semibold text-slate-900">Grade Submission</h3>
              <p className="text-sm text-slate-500">
                {activeRow.studentName} ({activeRow.studentCode})
              </p>
            </div>

            {activeRow.textContent && (
              <div>
                <p className="label">Submitted Content</p>
                <p className="text-sm text-slate-600 border border-slate-200 rounded-lg p-3 max-h-32 overflow-y-auto whitespace-pre-line">
                  {activeRow.textContent}
                </p>
              </div>
            )}
            {activeRow.fileUrl && (
              <a href={activeRow.fileUrl} target="_blank" className="text-sm text-brand-600 hover:underline block">
                View submitted file →
              </a>
            )}

            <div>
              <label className="label">Score (out of {maxScore})</label>
              <input
                type="number"
                min={0}
                max={maxScore}
                className="input"
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Written Feedback</label>
              <textarea
                className="input"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide constructive feedback referencing the rubric..."
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setOpenId(null)} className="btn-outline">
                Cancel
              </button>
              <button onClick={submitGrade} disabled={saving || score === ""} className="btn-primary">
                {saving ? "Saving..." : "Save Grade"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
