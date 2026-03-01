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

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-AE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading || !journal) {
    return (
      <ViewEditModal open={open} onClose={onClose}>
        <div className="py-20 text-center">
          <div className="inline-flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue2/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue2 border-t-transparent rounded-full animate-spin"></div>
              <i className="fas fa-journal-whills absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue2 text-lg"></i>
            </div>
            <p className="mt-4 text-[#8b8f8c] font-medium">Loading journal details...</p>
          </div>
        </div>
      </ViewEditModal>
    );
  }

  const statusBadge =
    journal.status === "Posted"
      ? "bg-green-50 text-green-600 border-green-200"
      : "bg-amber-50 text-amber-600 border-amber-200";

  const isBalanced = Math.abs(Number(journal.total_debits) - Number(journal.total_credits)) < 0.01;

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Journal Details"
      width="max-w-6xl"
    >
      {/* Header - Enhanced with your style */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-t-2xl border-b border-blue2/20 px-6 py-4 -mt-6 -mx-6 mb-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
              <i className="fas fa-journal-whills text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#1f221f] flex items-center gap-3">
                {journal.journal_number}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusBadge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    journal.status === "Posted" ? "bg-green-500" : "bg-amber-500"
                  }`}></span>
                  {journal.status}
                </span>
              </h1>
              <p className="text-sm text-[#4a636e] flex items-center gap-2">
                <i className="fas fa-calendar text-blue2/70 text-xs"></i>
                {formatDate(journal.date)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Journal Info Cards - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 mb-6">
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 hover:border-blue2/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue2/10 flex items-center justify-center">
              <i className="fas fa-hashtag text-blue2"></i>
            </div>
            <div>
              <p className="text-xs text-[#8b8f8c] uppercase tracking-wide">Journal Number</p>
              <p className="text-base font-semibold text-[#1f221f]">{journal.journal_number}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 hover:border-blue2/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#d9a44a]/10 flex items-center justify-center">
              <i className="fas fa-calendar-alt text-[#d9a44a]"></i>
            </div>
            <div>
              <p className="text-xs text-[#8b8f8c] uppercase tracking-wide">Journal Date</p>
              <p className="text-base font-semibold text-[#1f221f]">{formatDate(journal.date)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 hover:border-blue2/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <i className="fas fa-sticky-note text-purple-600"></i>
            </div>
            <div>
              <p className="text-xs text-[#8b8f8c] uppercase tracking-wide">Notes</p>
              <p className="text-base font-semibold text-[#1f221f] truncate max-w-[200px]" title={journal.notes}>
                {journal.notes || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Entries Table - Kept exactly as you requested */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mx-4 mb-6">
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

      {/* Totals Section - Enhanced */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-blue2 rounded-full"></div>
          <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
            <i className="fas fa-scale-balanced text-blue2 text-xs"></i>
            Balance Summary
          </h3>
        </div>

        <div className="bg-gradient-to-br from-white to-[#f6f6f4] rounded-xl border border-[#e5e7eb] p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Debits & Credits */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-[#e5e7eb]">
                <span className="text-[#4a636e] flex items-center gap-2">
                  <i className="fas fa-arrow-down text-green-600"></i>
                  Total Debits
                </span>
                <span className="font-mono font-semibold text-green-600">
                  AED {Number(journal.total_debits).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[#4a636e] flex items-center gap-2">
                  <i className="fas fa-arrow-up text-red-600"></i>
                  Total Credits
                </span>
                <span className="font-mono font-semibold text-red-600">
                  AED {Number(journal.total_credits).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Balance Status */}
            <div className="bg-white rounded-lg p-4 border border-[#e5e7eb]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#4a636e]">Difference:</span>
                <span className={`font-mono font-bold text-xl ${
                  isBalanced ? "text-green-600" : "text-red-600"
                }`}>
                  AED {(Number(journal.total_debits) - Number(journal.total_credits)).toFixed(2)}
                </span>
              </div>
              <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
                isBalanced ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                <i className={`fas ${isBalanced ? "fa-check-circle" : "fa-exclamation-circle"}`}></i>
                <span className="font-medium">
                  {isBalanced ? "Journal is BALANCED" : "Journal is UNBALANCED"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Enhanced */}
      <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 -mb-6 -mx-6 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-[#8b8f8c]">
          <span className="flex items-center gap-1.5">
            <i className="fas fa-fingerprint text-[10px]"></i>
            Journal ID: {journal.id}
          </span>
          {journal.created_at && (
            <>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <span className="flex items-center gap-1.5">
                <i className="fas fa-calendar-alt text-[10px]"></i>
                Created {formatDate(journal.created_at)}
              </span>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="inline-flex items-center px-4 py-2 bg-white border border-[#e5e7eb] rounded-lg text-sm font-medium text-[#4a636e] hover:bg-[#f6f6f4] hover:border-gray-400 transition-all"
        >
          <i className="fas fa-times mr-2"></i>
          Close
        </button>
      </div>
    </ViewEditModal>
  );
};

export default ManualJournalViewModal;