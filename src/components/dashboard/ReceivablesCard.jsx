import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const ReceivablesCard = ({ data }) => {

  if (!data) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:border-blue2/30 transition-all">

      {/* Header */}
      <div className="flex justify-between items-start mb-8">

        <div>
          <h3 className="text-xl font-semibold text-[#1f221f]">
            Invoices owed to you
          </h3>

          <p className="text-sm text-[#8b8f8c] mt-1">
            Manage and track your receivables
          </p>
        </div>

      </div>


      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-sm">

        <div className="flex items-center justify-between bg-[#f6f6f4] rounded-lg px-4 py-3">
          <span className="text-[#1f221f] font-medium">
            {data.drafts.count} Draft
          </span>
          <span className="font-semibold text-[#1f221f]">
            AED {data.drafts.total}
          </span>
        </div>

        <div className="flex items-center justify-between bg-[#f6f6f4] rounded-lg px-4 py-3">
          <span className="text-[#1f221f] font-medium">
            {data.awaiting.count} Awaiting
          </span>
          <span className="font-semibold text-[#1f221f]">
            AED {data.awaiting.total}
          </span>
        </div>

        <div className="flex items-center justify-between bg-[#f6f6f4] rounded-lg px-4 py-3">
          <span className="text-[#1f221f] font-medium">
            {data.overdue.count} Overdue
          </span>
          <span className="font-semibold text-[#1f221f]">
            AED {data.overdue.total}
          </span>
        </div>

      </div>


      {/* Chart */}
      <div style={{ height: 320 }}>

        <ResponsiveContainer width="100%" height="100%">

          <BarChart data={data.chart}>

            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{ fill: "#f6f6f4" }}
              formatter={(value) => [`AED ${value}`, "Invoices"]}
            />

            <Bar
              dataKey="total"
              fill="#5c7781"
              radius={[6, 6, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
};

export default ReceivablesCard;