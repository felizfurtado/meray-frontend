import React, { useEffect, useState } from "react";
import api from "../../api/api";

const ExpenseInvoiceMarkPaidModal = ({
  open,
  onClose,
  invoiceId,
  onSuccess
}) => {

  const [accounts, setAccounts] = useState([]);
  const [bankAccount, setBankAccount] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setBankAccount(null);

    api.get("/accounts/by-type/?type=Asset")
      .then(res => {

        const allAccounts = res.data.accounts || [];

        // 🔥 Keep only Cash (1010) and Bank (1020)
        const filtered = allAccounts.filter(acc =>
          acc.code === "1010" || acc.code === "1020"
        );

        setAccounts(filtered);

      })
      .catch(() => setAccounts([]));

  }, [open]);

  if (!open) return null;

  const submit = async () => {

    if (!bankAccount) {
      alert("Please select a payment account.");
      return;
    }

    try {
      setSaving(true);

      await api.post(`/expense-invoices/${invoiceId}/mark-paid/`, {
        bank_account: Number(bankAccount)
      });

      onSuccess?.();
      onClose();

    } catch (err) {
      console.log("BACKEND ERROR:", err.response?.data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg">

        <h2 className="text-lg font-semibold mb-4">
          Select Payment Account
        </h2>

        <select
          value={bankAccount || ""}
          onChange={(e) => setBankAccount(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-6"
        >
          <option value="">Select Bank / Cash Account</option>

          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.code} - {acc.name}
            </option>
          ))}

        </select>

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={!bankAccount || saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            {saving ? "Processing..." : "Confirm Payment"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default ExpenseInvoiceMarkPaidModal;