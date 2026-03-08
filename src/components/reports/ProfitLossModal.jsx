import { useState } from "react";
import api from "../../api/api";

export default function ProfitLossModal({ onClose }) {

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);

  const loadReport = async () => {

    if (!startDate || !endDate) return;

    const res = await api.get(
      `/reports/profit-loss/?start_date=${startDate}&end_date=${endDate}`
    );

    setData(res.data);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-[900px] max-h-[90vh] overflow-y-auto p-6">

        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Profit & Loss</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Date Filters */}

        <div className="flex gap-4 mb-6">

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />

          <button
            onClick={loadReport}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Generate
          </button>

        </div>

        {data && (
          <div>

            {/* Operating Income */}

            <h3 className="font-semibold text-lg mb-2">Operating Income</h3>

            {data.operating_income.map((row, i) => (
              <div key={i} className="flex justify-between py-1">
                <span>{row.account}</span>
                <span>{row.total}</span>
              </div>
            ))}

            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total Income</span>
              <span>{data.total_operating_income}</span>
            </div>

            {/* COGS */}

            <h3 className="font-semibold text-lg mt-6 mb-2">
              Cost of Goods Sold
            </h3>

            <div className="flex justify-between py-1">
              <span>COGS</span>
              <span>{data.cogs}</span>
            </div>

            {/* Gross Profit */}

            <div className="flex justify-between font-bold mt-4 border-t pt-2">
              <span>Gross Profit</span>
              <span>{data.gross_profit}</span>
            </div>

            {/* Expenses */}

            <h3 className="font-semibold text-lg mt-6 mb-2">
              Operating Expenses
            </h3>

            {data.operating_expenses.map((row, i) => (
              <div key={i} className="flex justify-between py-1">
                <span>{row.account}</span>
                <span>{row.total}</span>
              </div>
            ))}

            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total Expenses</span>
              <span>{data.total_operating_expenses}</span>
            </div>

            {/* Net Profit */}

            <div className="flex justify-between font-bold text-xl mt-6 border-t pt-3">
              <span>Net Profit</span>
              <span>{data.net_profit}</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}