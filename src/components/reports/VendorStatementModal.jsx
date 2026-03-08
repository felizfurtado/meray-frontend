import { useState, useEffect } from "react";
import api from "../../api/api";

export default function VendorStatementModal({ onClose }) {

  const [vendors, setVendors] = useState([]);
  const [vendor, setVendor] = useState("");
  const [data, setData] = useState(null);

  // Load Vendors
  useEffect(() => {

    const loadVendors = async () => {

      try {

        const res = await api.get("/vendors/list/");
        setVendors(res.data.rows || []);

      } catch (err) {

        console.error("Vendor load error", err);

      }

    };

    loadVendors();

  }, []);

  // Generate Report
  const loadReport = async () => {

    if (!vendor) return;

    try {

      const res = await api.get(
        `/reports/vendor-statement/?vendor=${vendor}`
      );

      setData(res.data);

    } catch (err) {

      console.error("Report load error", err);

    }

  };

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-[1100px] max-h-[90vh] overflow-y-auto p-6">

        {/* Header */}

        <div className="flex justify-between mb-6">

          <h2 className="text-xl font-semibold">
            Vendor Statement
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

          <select
            value={vendor}
            onChange={(e)=>setVendor(e.target.value)}
            className="border p-2 rounded w-72"
          >

            <option value="">
              Select Vendor
            </option>

            {vendors.map((v)=>(
              <option key={v.id} value={v.id}>
                {v.company}
              </option>
            ))}

          </select>

          <button
            onClick={loadReport}
            className="bg-blue2 text-white px-4 py-2 rounded"
          >
            Generate
          </button>

        </div>

        {/* Table */}

        {data && (

          <table className="w-full text-sm border">

            <thead className="bg-gray-100">

              <tr>
                <th className="p-2 border text-left">Date</th>
                <th className="p-2 border text-left">Reference</th>
                <th className="p-2 border text-left">Description</th>
                <th className="p-2 border text-right">Dr</th>
                <th className="p-2 border text-right">Cr</th>
                <th className="p-2 border text-right">Balance</th>
              </tr>

            </thead>

            <tbody>

              {data.transactions.map((t,i)=>(

                <tr key={i}>

                  <td className="border p-2">
                    {t.date}
                  </td>

                  <td className="border p-2">
                    {t.reference}
                  </td>

                  <td className="border p-2">
                    {t.description}
                  </td>

                  <td className="border p-2 text-right">
                    {t.debit}
                  </td>

                  <td className="border p-2 text-right">
                    {t.credit}
                  </td>

                  <td className="border p-2 text-right font-medium">
                    {t.balance}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

        {/* Total */}

        {data && (

          <div className="mt-6 text-right font-bold text-lg">

            Total Balance: {data.total_balance}

          </div>

        )}

      </div>

    </div>

  );

}