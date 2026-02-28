import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const ManualJournalViewModal = ({
  open,
  onClose,
  journalId,
}) => {
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !journalId) return;

    setLoading(true);
    api
      .get(`/manual-journals/${journalId}/`)
      .then((res) => setJournal(res.data.journal))
      .finally(() => setLoading(false));
  }, [open, journalId]);

  if (!open) return null;

  if (loading || !journal) {
    return (
      <ViewEditModal open={open} onClose={onClose}>
        <div className="py-20 text-center text-[#8b8f8c]">
          Loading journal...
        </div>
      </ViewEditModal>
    );
  }

  const statusBadge =
    journal.status === "Posted"
      ? "bg-green-100 text-green-600 border-green-200"
      : "bg-yellow-100 text-yellow-600 border-yellow-200";

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Journal Details"
      width="max-w-6xl"
    >
      {/* 🔷 Header */}
      <div className="relative bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-2xl border border-blue2/20 p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#1f221f]">
              {journal.journal_number}
            </h2>
            <p className="text-sm text-[#8b8f8c] mt-1">
              {journal.date}
            </p>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-medium border ${statusBadge}`}
          >
            {journal.status}
          </div>
        </div>
      </div>

      {/* 🔷 Entries Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-4 bg-gray-50 px-4 py-3 text-xs font-semibold text-[#8b8f8c] uppercase tracking-wide">
          <div>Account</div>
          <div>Description</div>
          <div className="text-right">Debit</div>
          <div className="text-right">Credit</div>
        </div>

        {journal.entries.map((entry, i) => (
          <div
            key={i}
            className="grid grid-cols-4 px-4 py-4 border-t text-sm items-center"
          >
            <div className="font-medium text-[#1f221f]">
              {entry.account_code
                ? `${entry.account_code} - ${entry.account_name}`
                : entry.account_name || entry.account}
            </div>

            <div className="text-[#4a636e]">
              {entry.description || "—"}
            </div>

            <div className="text-right font-semibold text-green-600">
              {entry.debit
                ? Number(entry.debit).toFixed(2)
                : "—"}
            </div>

            <div className="text-right font-semibold text-red-600">
              {entry.credit
                ? Number(entry.credit).toFixed(2)
                : "—"}
            </div>
          </div>
        ))}
      </div>

      {/* 🔷 Totals Section */}
      <div className="bg-[#f6f6f4] border border-gray-200 rounded-xl p-6 mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Total Debits</span>
          <span className="font-semibold text-green-600">
            {Number(journal.total_debits).toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between text-sm mb-2">
          <span>Total Credits</span>
          <span className="font-semibold text-red-600">
            {Number(journal.total_credits).toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between text-sm mt-3 pt-3 border-t">
          <span className="font-medium">Difference</span>
          <span
            className={`font-bold ${
              journal.is_balanced
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {(
              Number(journal.total_debits) -
              Number(journal.total_credits)
            ).toFixed(2)}
          </span>
        </div>

        <div className="mt-3 text-right text-xs">
          {journal.is_balanced ? (
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
      <div className="flex justify-end mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </ViewEditModal>
  );
};

export default ManualJournalViewModal;
