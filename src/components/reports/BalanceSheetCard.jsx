import { useState } from "react";
import BalanceSheetModal from "./BalanceSheetModal";

export default function BalanceSheetCard() {

  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="bg-white rounded-xl p-6 shadow hover:shadow-xl transition-all cursor-pointer border border-gray-100 group"
      >
        <div className="flex items-center justify-between mb-4">

          <div className="w-12 h-12 rounded-lg bg-blue2/10 flex items-center justify-center">
            <i className="fas fa-balance-scale text-blue2 text-xl"></i>
          </div>

          <i className="fas fa-arrow-right text-gray-400 group-hover:text-blue2"></i>

        </div>

        <h3 className="text-lg font-semibold text-gray-800">
          Balance Sheet
        </h3>

        <p className="text-gray-500 text-sm mt-2">
          View company assets, liabilities and equity as of a specific date
        </p>

        <div className="mt-4 text-blue2 text-sm font-medium">
          Generate Report →
        </div>
      </div>

      {open && (
        <BalanceSheetModal onClose={() => setOpen(false)} />
      )}
    </>
  );
}