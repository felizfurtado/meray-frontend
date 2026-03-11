```jsx
import React from "react";

const SalesInvoicePDF = ({ invoice, company }) => {

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED"
    }).format(val || 0);

  return (
    <div className="max-w-4xl mx-auto bg-white p-10 text-gray-800">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-10">

        <div className="flex items-center gap-4">
          {company?.logo && (
            <img
              src={company.logo}
              alt="logo"
              className="w-16 h-16 object-contain"
            />
          )}

          <div>
            <h1 className="text-2xl font-bold">
              {company?.company_name}
            </h1>

            <p className="text-sm text-gray-500">
              {company?.company_address}
            </p>

            <p className="text-sm text-gray-500">
              {company?.email}
            </p>
          </div>
        </div>

        <div className="text-right">
          <h2 className="text-3xl font-bold text-blue-600">
            INVOICE
          </h2>

          <p className="text-sm mt-2">
            <strong>Invoice #:</strong> {invoice?.number}
          </p>

          <p className="text-sm">
            <strong>Date:</strong> {invoice?.date}
          </p>

          <p className="text-sm">
            <strong>Status:</strong> {invoice?.status}
          </p>
        </div>
      </div>


      {/* CUSTOMER */}
      <div className="mb-8">
        <h3 className="text-gray-600 text-sm uppercase mb-2">
          Bill To
        </h3>

        <p className="font-semibold text-lg">
          {invoice?.customer_name || "Walk-in Customer"}
        </p>
      </div>


      {/* ITEMS TABLE */}
      <table className="w-full border-collapse mb-8">

        <thead>
          <tr className="bg-gray-100 text-left text-sm">
            <th className="p-3">Item</th>
            <th className="p-3">Qty</th>
            <th className="p-3">Price</th>
            <th className="p-3">VAT</th>
            <th className="p-3 text-right">Total</th>
          </tr>
        </thead>

        <tbody>
          {invoice?.items?.map((item, i) => {

            const total =
              Number(item.line_amount || 0) +
              Number(item.vat_amount || 0);

            return (
              <tr key={i} className="border-b text-sm">

                <td className="p-3">
                  {item.item_name}
                </td>

                <td className="p-3">
                  {item.quantity}
                </td>

                <td className="p-3">
                  {formatCurrency(item.price)}
                </td>

                <td className="p-3">
                  {formatCurrency(item.vat_amount)}
                </td>

                <td className="p-3 text-right font-medium">
                  {formatCurrency(total)}
                </td>

              </tr>
            );
          })}
        </tbody>

      </table>


      {/* TOTALS */}
      <div className="flex justify-end">

        <div className="w-64 space-y-2 text-sm">

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>
              {formatCurrency(invoice?.subtotal)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>VAT</span>
            <span>
              {formatCurrency(invoice?.vat)}
            </span>
          </div>

          <div className="flex justify-between border-t pt-2 font-bold text-lg">
            <span>Total</span>
            <span>
              {formatCurrency(invoice?.total)}
            </span>
          </div>

        </div>

      </div>


      {/* SIGNATURE */}
      <div className="mt-20 flex justify-end text-center">

        <div>

          {company?.signature && (
            <img
              src={company.signature}
              className="h-16 mx-auto mb-2"
              alt="signature"
            />
          )}

          <p className="border-t pt-2 text-sm">
            Authorized Signature
          </p>

        </div>

      </div>

    </div>
  );
};

export default SalesInvoicePDF;
```
