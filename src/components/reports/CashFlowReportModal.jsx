import { useState } from "react";
import api from "../../api/api";

export default function CashFlowReportModal({ onClose }) {

  const [start,setStart] = useState("");
  const [end,setEnd] = useState("");
  const [data,setData] = useState(null);

  const loadReport = async () => {

    if(!start || !end) return;

    try{

      const res = await api.get(
        `/reports/cash-flow/?start=${start}&end=${end}`
      );

      setData(res.data);

    }catch(err){
      console.error("Cash flow error",err);
    }

  };

  return(

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-[950px] max-h-[90vh] overflow-y-auto p-6">

        {/* Header */}

        <div className="flex justify-between mb-6">

          <h2 className="text-xl font-semibold">
            Cash Flow Statement
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>

        </div>


        {/* Filters */}

        <div className="flex gap-4 mb-6">

          <input
            type="date"
            value={start}
            onChange={(e)=>setStart(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="date"
            value={end}
            onChange={(e)=>setEnd(e.target.value)}
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

        <div className="space-y-8">

          {/* OPERATING */}

          <div>

            <h3 className="font-semibold text-lg mb-3">
              Cash Flow from Operating Activities
            </h3>

            <table className="w-full text-sm border">

              <tbody>

                <tr>
                  <td className="p-2 border">Net Income</td>
                  <td className="p-2 border text-right">
                    {data.operating.net_income}
                  </td>
                </tr>

                <tr>
                  <td className="p-2 border">
                    Change in Accounts Receivable
                  </td>
                  <td className="p-2 border text-right">
                    {data.operating.change_ar}
                  </td>
                </tr>

                <tr>
                  <td className="p-2 border">
                    Change in Inventory
                  </td>
                  <td className="p-2 border text-right">
                    {data.operating.change_inventory}
                  </td>
                </tr>

                <tr>
                  <td className="p-2 border">
                    Change in Accounts Payable
                  </td>
                  <td className="p-2 border text-right">
                    {data.operating.change_ap}
                  </td>
                </tr>

                <tr className="font-semibold bg-gray-50">
                  <td className="p-2 border">
                    Operating Cash Flow
                  </td>
                  <td className="p-2 border text-right">
                    {data.operating.operating_cash_flow}
                  </td>
                </tr>

              </tbody>

            </table>

          </div>


          {/* INVESTING */}

          <div>

            <h3 className="font-semibold text-lg mb-3">
              Cash Flow from Investing Activities
            </h3>

            <table className="w-full text-sm border">

              <tbody>

                <tr className="bg-gray-50 font-semibold">
                  <td className="p-2 border">
                    Investing Cash Flow
                  </td>

                  <td className="p-2 border text-right">
                    {data.investing.cash_flow}
                  </td>
                </tr>

              </tbody>

            </table>

          </div>


          {/* FINANCING */}

          <div>

            <h3 className="font-semibold text-lg mb-3">
              Cash Flow from Financing Activities
            </h3>

            <table className="w-full text-sm border">

              <tbody>

                <tr className="bg-gray-50 font-semibold">

                  <td className="p-2 border">
                    Financing Cash Flow
                  </td>

                  <td className="p-2 border text-right">
                    {data.financing.cash_flow}
                  </td>

                </tr>

              </tbody>

            </table>

          </div>


          {/* CASH SUMMARY */}

          <div>

            <h3 className="font-semibold text-lg mb-3">
              Cash Summary
            </h3>

            <table className="w-full text-sm border">

              <tbody>

                <tr>
                  <td className="p-2 border">
                    Beginning Cash Balance
                  </td>
                  <td className="p-2 border text-right">
                    {data.cash_summary.beginning_cash}
                  </td>
                </tr>

                <tr>
                  <td className="p-2 border">
                    Cash In
                  </td>
                  <td className="p-2 border text-right">
                    {data.cash_summary.cash_in}
                  </td>
                </tr>

                <tr>
                  <td className="p-2 border">
                    Cash Out
                  </td>
                  <td className="p-2 border text-right">
                    {data.cash_summary.cash_out}
                  </td>
                </tr>

                <tr>
                  <td className="p-2 border">
                    Net Change in Cash
                  </td>
                  <td className="p-2 border text-right">
                    {data.cash_summary.net_change}
                  </td>
                </tr>

                <tr className="bg-gray-100 font-semibold">
                  <td className="p-2 border">
                    Ending Cash Balance
                  </td>
                  <td className="p-2 border text-right">
                    {data.cash_summary.ending_cash}
                  </td>
                </tr>

              </tbody>

            </table>

          </div>

        </div>

        )}

      </div>

    </div>

  );

}