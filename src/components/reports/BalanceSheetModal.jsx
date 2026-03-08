import { useState } from "react";
import api from "../../api/api";

export default function BalanceSheetModal({ onClose }) {

  const [date, setDate] = useState("");
  const [data, setData] = useState(null);

  const loadReport = async () => {

    if (!date) return;

    const res = await api.get(`/reports/balance-sheet/?date=${date}`);

    setData(res.data);
  };

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-[900px] max-h-[90vh] overflow-y-auto p-6">

        {/* Header */}

        <div className="flex justify-between mb-4">

          <h2 className="text-xl font-semibold">
            Balance Sheet
          </h2>

          <button onClick={onClose}>
            ✕
          </button>

        </div>

        {/* Date Filter */}

        <div className="flex gap-4 mb-6">

          <input
            type="date"
            value={date}
            onChange={(e)=>setDate(e.target.value)}
            className="border p-2 rounded"
          />

          <button
            onClick={loadReport}
            className="bg-blue2 text-white px-4 py-2 rounded"
          >
            Generate
          </button>

        </div>

        {data && (

          <div>

            {/* ASSETS */}

            <h3 className="text-lg font-semibold mb-2">
              Assets
            </h3>

            {data.assets.map((a,i)=>(
              <div key={i} className="flex justify-between py-1">
                <span>{a.name}</span>
                <span>{a.balance}</span>
              </div>
            ))}

            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total Assets</span>
              <span>{data.total_assets}</span>
            </div>


            {/* LIABILITIES */}

            <h3 className="text-lg font-semibold mt-6 mb-2">
              Liabilities
            </h3>

            {data.liabilities.map((a,i)=>(
              <div key={i} className="flex justify-between py-1">
                <span>{a.name}</span>
                <span>{a.balance}</span>
              </div>
            ))}

            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total Liabilities</span>
              <span>{data.total_liabilities}</span>
            </div>


            {/* EQUITY */}

            <h3 className="text-lg font-semibold mt-6 mb-2">
              Equity
            </h3>

            {data.equity.map((a,i)=>(
              <div key={i} className="flex justify-between py-1">
                <span>{a.name}</span>
                <span>{a.balance}</span>
              </div>
            ))}

            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total Equity</span>
              <span>{data.total_equity}</span>
            </div>


            {/* CHECK */}

            <div className="flex justify-between font-bold text-lg mt-6 border-t pt-3">

              <span>Balance Check</span>

              <span>
                {data.balance_check}
              </span>

            </div>

          </div>

        )}

      </div>

    </div>

  );
}