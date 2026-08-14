"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Material {
  id: string;
  title: string;
  type: string;
  url: string;
  createdAt: string | Date;
}

export default function MaterialsPanel({
  sessionId,
  materials,
  canEdit,
}: {
  sessionId: string;
  materials: Material[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("notes");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch(`/api/sessions/${sessionId}/materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, type, url }),
    });
    setSaving(false);
    if (res.ok) {
      setTitle("");
      setUrl("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to add material.");
    }
  }

  async function handleDelete(materialId: string) {
    await fetch(`/api/sessions/${sessionId}/materials?materialId=${materialId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="card space-y-4">
      <h2 className="font-semibold text-slate-900">Materials (Notes / Slides / Recording)</h2>

      {materials.length === 0 ? (
        <p className="text-sm text-slate-500">No materials uploaded yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {materials.map((m) => (
            <li key={m.id} className="py-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{m.title}</p>
                <a href={m.url} target="_blank" className="text-xs text-brand-600 hover:underline truncate block">
                  {m.type} · {m.url}
                </a>
              </div>
              {canEdit && (
                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-xs text-red-600 hover:underline shrink-0"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <input
            className="input sm:col-span-1"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <select className="input sm:col-span-1" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="notes">Notes</option>
            <option value="slides">Slides</option>
            <option value="recording">Recording</option>
            <option value="resource">Resource</option>
          </select>
          <input
            className="input sm:col-span-1"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button type="submit" disabled={saving} className="btn-secondary sm:col-span-1">
            {saving ? "Adding..." : "Add Material"}
          </button>
          {error && <p className="text-sm text-red-600 sm:col-span-4">{error}</p>}
        </form>
      )}
    </div>
  );
}
