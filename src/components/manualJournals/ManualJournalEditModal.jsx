import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const ManualJournalEditModal = ({
  open,
  onClose,
  journalId,
  refetchJournals,
}) => {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !journalId) return;

    setLoading(true);
    api
      .get(`/manual-journals/${journalId}/`)
      .then((res) => setForm(res.data.journal))
      .finally(() => setLoading(false));
  }, [open, journalId]);

  if (!open) return null;

  if (loading || !form) {
    return (
      <ViewEditModal open={open} onClose={onClose} title="Edit Journal">
        <div className="py-20 text-center">Loading journal...</div>
      </ViewEditModal>
    );
  }

  const updateEntry = (i, key, value) => {
    const updated = [...form.entries];
    updated[i][key] = value;
    setForm({ ...form, entries: updated });
  };

  const totalDebits = form.entries.reduce(
    (sum, e) => sum + Number(e.debit || 0),
    0
  );

  const totalCredits = form.entries.reduce(
    (sum, e) => sum + Number(e.credit || 0),
    0
  );

  const difference = totalDebits - totalCredits;
  const isBalanced = Math.abs(difference) < 0.01;

  const save = async () => {
    setSaving(true);
    await api.put(
      `/manual-journals/${journalId}/update/`,
      form
    );
    setSaving(false);
    onClose();
    refetchJournals?.();
  };

  const locked = form.status === "Posted";

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Edit Manual Journal"
      width="max-w-6xl"
    >
      {/* 🔷 Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-2xl border border-blue2/20 p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[#1f221f]">
              {form.journal_number}
            </h2>
            <p className="text-sm text-[#8b8f8c]">
              Edit journal details
            </p>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              locked
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-blue2/10 text-blue2 border-blue2/20"
            }`}
          >
            {form.status}
          </div>
        </div>
      </div>

      {/* 🔷 Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Field
          label="Date"
          type="date"
          value={form.date}
          disabled={locked}
          onChange={(v) =>
            setForm({ ...form, date: v })
          }
        />

        <Field
          label="Status"
          type="select"
          value={form.status}
          disabled={locked}
          options={["Draft", "Posted"]}
          onChange={(v) =>
            setForm({ ...form, status: v })
          }
        />

        <Field
          label="Currency"
          value={form.currency}
          disabled
        />
      </div>

      {/* 🔷 Entries Section */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[#1f221f] mb-4 flex items-center gap-2">
          <i className="fas fa-list text-blue2"></i>
          Journal Entries
        </h3>

        <div className="space-y-4">
          {form.entries.map((entry, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-gray-200 rounded-xl p-4"
            >
              <Input
                label="Account"
                value={entry.account}
                disabled={locked}
                onChange={(v) =>
                  updateEntry(i, "account", v)
                }
              />

              <Input
                label="Description"
                value={entry.description || ""}
                disabled={locked}
                onChange={(v) =>
                  updateEntry(i, "description", v)
                }
              />

              <Input
                label="Debit"
                type="number"
                value={entry.debit}
                disabled={locked}
                onChange={(v) =>
                  updateEntry(i, "debit", v)
                }
              />

              <Input
                label="Credit"
                type="number"
                value={entry.credit}
                disabled={locked}
                onChange={(v) =>
                  updateEntry(i, "credit", v)
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* 🔷 Totals Section */}
      <div className="bg-[#f6f6f4] rounded-xl p-6 border border-gray-200">
        <div className="flex justify-between text-sm mb-2">
          <span>Total Debits</span>
          <span className="font-semibold">
            {totalDebits.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between text-sm mb-2">
          <span>Total Credits</span>
          <span className="font-semibold">
            {totalCredits.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between text-sm mt-3 pt-3 border-t">
          <span className="font-medium">Difference</span>
          <span
            className={`font-bold ${
              isBalanced ? "text-green-600" : "text-red-600"
            }`}
          >
            {difference.toFixed(2)}
          </span>
        </div>

        <div className="mt-3 text-right text-xs">
          {isBalanced ? (
            <span className="text-green-600">
              ✔ Journal is balanced
            </span>
          ) : (
            <span className="text-red-600">
              ✖ Debits must equal credits
            </span>
          )}
        </div>
      </div>

      {/* 🔷 Footer */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          Cancel
        </button>

        {!locked && (
          <button
            onClick={save}
            disabled={saving || !isBalanced}
            className="px-5 py-2 bg-blue2 text-white rounded-lg text-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>
    </ViewEditModal>
  );
};

export default ManualJournalEditModal;

/* 🔹 Reusable UI Fields */

const Field = ({
  label,
  type = "text",
  value,
  onChange,
  disabled,
  options,
}) => (
  <div>
    <label className="text-xs text-[#8b8f8c] mb-1 block">
      {label}
    </label>

    {type === "select" ? (
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value || ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
    )}
  </div>
);

const Input = Field;
