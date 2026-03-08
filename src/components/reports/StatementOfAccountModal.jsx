import { useState, useEffect } from "react";
import api from "../../api/api";

export default function StatementOfAccountModal({ onClose }) {

  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState("");
  const [data, setData] = useState(null);

  // Load customers
  useEffect(() => {

    const loadCustomers = async () => {

      try {

        const res = await api.get("/customers/list/");
        setCustomers(res.data.rows);

      } catch (err) {

        console.error("Customer load error", err);

      }

    };

    loadCustomers();

  }, []);

  // Load statement report
  const loadReport = async () => {

    if (!customer) return;

    try {

      const res = await api.get(
        `/reports/statement-of-account/?customer=${customer}`
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
            Statement of Account
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
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="border p-2 rounded w-72"
          >

            <option value="">
              Select Customer
            </option>

            {customers.map((c) => (

              <option key={c.id} value={c.id}>
                {c.company}
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


        {/* Transactions Table */}

        {data && (

          <table className="w-full text-sm border">

            <thead className="bg-gray-100">

              <tr>
                <th className="p-2 border text-left">Date</th>
                <th className="p-2 border text-left">Invoice</th>
                <th className="p-2 border text-left">Description</th>
                <th className="p-2 border text-right">Dr</th>
                <th className="p-2 border text-right">Cr</th>
                <th className="p-2 border text-right">Balance</th>
              </tr>

            </thead>

            <tbody>

              {data.transactions.map((t, i) => (

                <tr key={i}>

                  <td className="border p-2">
                    {t.date}
                  </td>

                  <td className="border p-2">
                    {t.invoice}
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