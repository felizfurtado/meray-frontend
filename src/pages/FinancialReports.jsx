import React, { useState } from 'react';

const FinancialReports = () => {
  const [activeTab, setActiveTab] = useState('balance-sheet');
  const [dateRange, setDateRange] = useState('2024');
  const [comparisonPeriod, setComparisonPeriod] = useState('previous-year');

  // Balance Sheet Data
  const balanceSheetData = {
    assets: {
      currentAssets: [
        { name: 'Cash and Cash Equivalents', current: 125000, previous: 98000, change: '+27.6%' },
        { name: 'Accounts Receivable', current: 85000, previous: 72000, change: '+18.1%' },
        { name: 'Inventory', current: 45000, previous: 38000, change: '+18.4%' },
        { name: 'Prepaid Expenses', current: 12000, previous: 10000, change: '+20.0%' },
        { name: 'Marketable Securities', current: 25000, previous: 22000, change: '+13.6%' }
      ],
      nonCurrentAssets: [
        { name: 'Property, Plant & Equipment', current: 185000, previous: 175000, change: '+5.7%' },
        { name: 'Accumulated Depreciation', current: -35000, previous: -30000, change: '+16.7%' },
        { name: 'Intangible Assets', current: 50000, previous: 50000, change: '0.0%' },
        { name: 'Goodwill', current: 75000, previous: 75000, change: '0.0%' }
      ]
    },
    liabilities: {
      currentLiabilities: [
        { name: 'Accounts Payable', current: 45000, previous: 38000, change: '+18.4%' },
        { name: 'Short-term Debt', current: 25000, previous: 20000, change: '+25.0%' },
        { name: 'Accrued Expenses', current: 18000, previous: 15000, change: '+20.0%' },
        { name: 'Deferred Revenue', current: 12000, previous: 10000, change: '+20.0%' }
      ],
      nonCurrentLiabilities: [
        { name: 'Long-term Debt', current: 95000, previous: 100000, change: '-5.0%' },
        { name: 'Deferred Tax Liability', current: 15000, previous: 14000, change: '+7.1%' },
        { name: 'Lease Liabilities', current: 25000, previous: 20000, change: '+25.0%' }
      ]
    },
    equity: [
      { name: 'Common Stock', current: 100000, previous: 100000, change: '0.0%' },
      { name: 'Retained Earnings', current: 185000, previous: 152000, change: '+21.7%' },
      { name: 'Additional Paid-in Capital', current: 50000, previous: 50000, change: '0.0%' },
      { name: 'Treasury Stock', current: -15000, previous: -12000, change: '+25.0%' }
    ]
  };

  // Profit & Loss Data
  const profitLossData = {
    revenue: [
      { name: 'Product Sales', current: 450000, previous: 380000, change: '+18.4%' },
      { name: 'Service Revenue', current: 180000, previous: 150000, change: '+20.0%' },
      { name: 'Interest Income', current: 5000, previous: 4000, change: '+25.0%' },
      { name: 'Other Income', current: 8000, previous: 6000, change: '+33.3%' }
    ],
    cogs: [
      { name: 'Cost of Goods Sold', current: -225000, previous: -190000, change: '+18.4%' },
      { name: 'Freight & Shipping', current: -15000, previous: -12000, change: '+25.0%' },
      { name: 'Inventory Write-down', current: -5000, previous: -3000, change: '+66.7%' }
    ],
    operatingExpenses: [
      { name: 'Salaries and Wages', current: -120000, previous: -100000, change: '+20.0%' },
      { name: 'Rent Expense', current: -36000, previous: -30000, change: '+20.0%' },
      { name: 'Marketing & Advertising', current: -25000, previous: -20000, change: '+25.0%' },
      { name: 'Utilities', current: -12000, previous: -10000, change: '+20.0%' },
      { name: 'Depreciation', current: -15000, previous: -12000, change: '+25.0%' },
      { name: 'Office Supplies', current: -8000, previous: -6000, change: '+33.3%' }
    ],
    otherItems: [
      { name: 'Interest Expense', current: -5000, previous: -6000, change: '-16.7%' },
      { name: 'Tax Expense', current: -35000, previous: -28000, change: '+25.0%' }
    ]
  };

  // Cash Flow Data
  const cashFlowData = {
    operatingActivities: [
      { name: 'Net Income', amount: 128000 },
      { name: 'Depreciation & Amortization', amount: 15000 },
      { name: 'Accounts Receivable', amount: -13000 },
      { name: 'Inventory', amount: -7000 },
      { name: 'Accounts Payable', amount: 7000 },
      { name: 'Accrued Expenses', amount: 3000 }
    ],
    investingActivities: [
      { name: 'Purchase of Equipment', amount: -25000 },
      { name: 'Sale of Investments', amount: 5000 },
      { name: 'Purchase of Securities', amount: -10000 }
    ],
    financingActivities: [
      { name: 'Proceeds from Loan', amount: 15000 },
      { name: 'Repayment of Debt', amount: -5000 },
      { name: 'Dividends Paid', amount: -20000 },
      { name: 'Stock Issuance', amount: 0 }
    ]
  };

  // Custom Reports Data
  const customReports = [
    {
      id: 1,
      name: 'Sales by Region',
      description: 'Monthly sales performance by geographical region',
      createdBy: 'Sarah Johnson',
      lastRun: '2024-01-15',
      fields: ['Region', 'Sales Amount', 'Growth %', 'Target', 'Variance'],
      filters: ['Date Range', 'Product Category', 'Sales Rep']
    },
    {
      id: 2,
      name: 'Expense Analysis',
      description: 'Detailed expense breakdown by department',
      createdBy: 'Michael Chen',
      lastRun: '2024-01-14',
      fields: ['Department', 'Expense Type', 'Amount', 'Budget', 'Variance %'],
      filters: ['Month', 'Expense Category', 'Cost Center']
    },
    {
      id: 3,
      name: 'Customer Profitability',
      description: 'Profitability analysis by customer segment',
      createdBy: 'Emma Garcia',
      lastRun: '2024-01-12',
      fields: ['Customer Segment', 'Revenue', 'Cost', 'Profit Margin', 'Lifetime Value'],
      filters: ['Time Period', 'Product Line', 'Region']
    },
    {
      id: 4,
      name: 'Inventory Turnover',
      description: 'Inventory efficiency and turnover rates',
      createdBy: 'David Wilson',
      lastRun: '2024-01-10',
      fields: ['Product Category', 'Opening Stock', 'Closing Stock', 'Turnover Ratio', 'Days in Inventory'],
      filters: ['Warehouse', 'Product Type', 'Date Range']
    }
  ];

  // Calculate totals
  const calculateTotal = (items) => items.reduce((sum, item) => sum + item.current, 0);
  const calculateTotalAbs = (items) => items.reduce((sum, item) => sum + Math.abs(item.amount), 0);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Render balance sheet
  const renderBalanceSheet = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assets */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-emerald-400"></div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                <i className="fas fa-building text-emerald-600"></i>
              </div>
              Assets
            </h3>
            
            {/* Current Assets */}
            <div className="mb-6">
              <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                <i className="fas fa-arrow-right text-blue2"></i>
                Current Assets
              </h4>
              <div className="space-y-2">
                {balanceSheetData.assets.currentAssets.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                    <div className="text-sm text-slate-700">{item.name}</div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900">{formatCurrency(item.current)}</div>
                      <div className="text-xs text-slate-500">{item.change} vs {dateRange === '2024' ? '2023' : 'Previous'}</div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-xl border border-emerald-200">
                  <div className="text-sm font-medium text-slate-900">Total Current Assets</div>
                  <div className="text-lg font-bold text-emerald-600">
                    {formatCurrency(calculateTotal(balanceSheetData.assets.currentAssets))}
                  </div>
                </div>
              </div>
            </div>

            {/* Non-Current Assets */}
            <div>
              <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                <i className="fas fa-arrow-right text-blue2"></i>
                Non-Current Assets
              </h4>
              <div className="space-y-2">
                {balanceSheetData.assets.nonCurrentAssets.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                    <div className="text-sm text-slate-700">{item.name}</div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${item.current >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                        {formatCurrency(item.current)}
                      </div>
                      <div className="text-xs text-slate-500">{item.change} vs {dateRange === '2024' ? '2023' : 'Previous'}</div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-xl border border-emerald-200">
                  <div className="text-sm font-medium text-slate-900">Total Non-Current Assets</div>
                  <div className="text-lg font-bold text-emerald-600">
                    {formatCurrency(calculateTotal(balanceSheetData.assets.nonCurrentAssets))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Liabilities & Equity */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-500 to-rose-400"></div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center">
                <i className="fas fa-file-invoice-dollar text-rose-600"></i>
              </div>
              Liabilities
            </h3>
            
            {/* Current Liabilities */}
            <div className="mb-4">
              <h4 className="font-medium text-slate-700 mb-2 text-sm">Current Liabilities</h4>
              <div className="space-y-2">
                {balanceSheetData.liabilities.currentLiabilities.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-50/50 rounded-lg">
                    <div className="text-sm text-slate-700">{item.name}</div>
                    <div className="text-sm font-medium text-slate-900">{formatCurrency(item.current)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-Current Liabilities */}
            <div className="mb-4">
              <h4 className="font-medium text-slate-700 mb-2 text-sm">Non-Current Liabilities</h4>
              <div className="space-y-2">
                {balanceSheetData.liabilities.nonCurrentLiabilities.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-50/50 rounded-lg">
                    <div className="text-sm text-slate-700">{item.name}</div>
                    <div className="text-sm font-medium text-slate-900">{formatCurrency(item.current)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-50/50 to-rose-100/30 rounded-xl border border-rose-200 mt-4">
              <div className="text-sm font-medium text-slate-900">Total Liabilities</div>
              <div className="text-lg font-bold text-rose-600">
                {formatCurrency(
                  calculateTotal(balanceSheetData.liabilities.currentLiabilities) +
                  calculateTotal(balanceSheetData.liabilities.nonCurrentLiabilities)
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-purple-400"></div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center">
                <i className="fas fa-hand-holding-usd text-purple-600"></i>
              </div>
              Equity
            </h3>
            
            <div className="space-y-2">
              {balanceSheetData.equity.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50/50 rounded-lg">
                  <div className="text-sm text-slate-700">{item.name}</div>
                  <div className={`text-sm font-medium ${item.current >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                    {formatCurrency(item.current)}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50/50 to-purple-100/30 rounded-xl border border-purple-200 mt-2">
                <div className="text-sm font-medium text-slate-900">Total Equity</div>
                <div className="text-lg font-bold text-purple-600">
                  {formatCurrency(calculateTotal(balanceSheetData.equity))}
                </div>
              </div>
            </div>
          </div>

          {/* Balance Sheet Summary */}
          <div className="bg-gradient-to-r from-blue2/10 to-blue2/5 rounded-2xl border border-blue2/20 p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue2">
                {formatCurrency(
                  calculateTotal(balanceSheetData.assets.currentAssets) +
                  calculateTotal(balanceSheetData.assets.nonCurrentAssets)
                )}
              </div>
              <div className="text-sm text-slate-600">Total Assets</div>
            </div>
            <div className="text-center mt-4">
              <div className="text-2xl font-bold text-blue2">
                {formatCurrency(
                  calculateTotal(balanceSheetData.liabilities.currentLiabilities) +
                  calculateTotal(balanceSheetData.liabilities.nonCurrentLiabilities) +
                  calculateTotal(balanceSheetData.equity)
                )}
              </div>
              <div className="text-sm text-slate-600">Liabilities + Equity</div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm text-emerald-600 font-medium">
                <i className="fas fa-check-circle mr-1"></i>
                Balance Sheet is Balanced
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render profit & loss
  const renderProfitLoss = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-emerald-400"></div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                <i className="fas fa-chart-line text-emerald-600"></i>
              </div>
              Revenue
            </h3>
            
            <div className="space-y-3">
              {profitLossData.revenue.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.change} vs {dateRange === '2024' ? '2023' : 'Previous'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-600">{formatCurrency(item.current)}</div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-xl border border-emerald-200">
                <div className="text-lg font-semibold text-slate-900">Total Revenue</div>
                <div className="text-xl font-bold text-emerald-600">
                  {formatCurrency(calculateTotal(profitLossData.revenue))}
                </div>
              </div>
            </div>
          </div>

          {/* Cost of Goods Sold */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-amber-400"></div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center">
                <i className="fas fa-boxes text-amber-600"></i>
              </div>
              Cost of Goods Sold
            </h3>
            
            <div className="space-y-3">
              {profitLossData.cogs.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                  <div className="text-sm font-medium text-slate-900">{item.name}</div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-rose-600">{formatCurrency(item.current)}</div>
                    <div className="text-xs text-slate-500">{item.change}</div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50/50 to-amber-100/30 rounded-xl border border-amber-200">
                <div className="text-lg font-semibold text-slate-900">Total COGS</div>
                <div className="text-xl font-bold text-rose-600">
                  {formatCurrency(calculateTotal(profitLossData.cogs))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses & Profit */}
        <div className="space-y-6">
          {/* Operating Expenses */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-400"></div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
                <i className="fas fa-file-invoice text-blue-600"></i>
              </div>
              Operating Expenses
            </h3>
            
            <div className="space-y-3">
              {profitLossData.operatingExpenses.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                  <div className="text-sm font-medium text-slate-900">{item.name}</div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-rose-600">{formatCurrency(item.current)}</div>
                    <div className="text-xs text-slate-500">{item.change}</div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-blue-100/30 rounded-xl border border-blue-200">
                <div className="text-lg font-semibold text-slate-900">Total Operating Expenses</div>
                <div className="text-xl font-bold text-rose-600">
                  {formatCurrency(calculateTotal(profitLossData.operatingExpenses))}
                </div>
              </div>
            </div>
          </div>

          {/* Profit Summary */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-2xl border border-emerald-200 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-600">Gross Profit</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(
                      calculateTotal(profitLossData.revenue) + calculateTotal(profitLossData.cogs)
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Operating Profit</div>
                  <div className="text-2xl font-bold text-blue2">
                    {formatCurrency(
                      calculateTotal(profitLossData.revenue) + 
                      calculateTotal(profitLossData.cogs) + 
                      calculateTotal(profitLossData.operatingExpenses)
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue2/10 to-blue2/5 rounded-2xl border border-blue2/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600">Net Profit Before Tax</div>
                  <div className="text-lg font-bold text-slate-900">
                    {formatCurrency(
                      calculateTotal(profitLossData.revenue) + 
                      calculateTotal(profitLossData.cogs) + 
                      calculateTotal(profitLossData.operatingExpenses) + 
                      calculateTotal(profitLossData.otherItems)
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600">Profit Margin</div>
                  <div className="text-lg font-bold text-emerald-600">24.8%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render cash flow
  const renderCashFlow = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operating Activities */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-emerald-400"></div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
              <i className="fas fa-exchange-alt text-emerald-600"></i>
            </div>
            Operating Activities
          </h3>
          
          <div className="space-y-3">
            {cashFlowData.operatingActivities.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                <div className="text-sm font-medium text-slate-900">{item.name}</div>
                <div className={`text-sm font-bold ${item.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrency(item.amount)}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-xl border border-emerald-200">
              <div className="text-lg font-semibold text-slate-900">Net Cash from Operations</div>
              <div className="text-xl font-bold text-emerald-600">
                {formatCurrency(calculateTotalAbs(cashFlowData.operatingActivities.filter(item => item.amount > 0)))}
              </div>
            </div>
          </div>
        </div>

        {/* Investing Activities */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-400"></div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
              <i className="fas fa-chart-pie text-blue-600"></i>
            </div>
            Investing Activities
          </h3>
          
          <div className="space-y-3">
            {cashFlowData.investingActivities.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                <div className="text-sm font-medium text-slate-900">{item.name}</div>
                <div className={`text-sm font-bold ${item.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrency(item.amount)}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-blue-100/30 rounded-xl border border-blue-200">
              <div className="text-lg font-semibold text-slate-900">Net Cash from Investing</div>
              <div className="text-xl font-bold text-rose-600">
                {formatCurrency(calculateTotalAbs(cashFlowData.investingActivities))}
              </div>
            </div>
          </div>
        </div>

        {/* Financing Activities */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-purple-400"></div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center">
              <i className="fas fa-hand-holding-usd text-purple-600"></i>
            </div>
            Financing Activities
          </h3>
          
          <div className="space-y-3">
            {cashFlowData.financingActivities.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                <div className="text-sm font-medium text-slate-900">{item.name}</div>
                <div className={`text-sm font-bold ${item.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrency(item.amount)}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50/50 to-purple-100/30 rounded-xl border border-purple-200">
              <div className="text-lg font-semibold text-slate-900">Net Cash from Financing</div>
              <div className="text-xl font-bold text-rose-600">
                {formatCurrency(calculateTotalAbs(cashFlowData.financingActivities))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue2/10 to-blue2/5 rounded-2xl border border-blue2/20 p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue2">
              {formatCurrency(
                calculateTotalAbs(cashFlowData.operatingActivities.filter(item => item.amount > 0)) +
                calculateTotalAbs(cashFlowData.investingActivities.filter(item => item.amount > 0)) +
                calculateTotalAbs(cashFlowData.financingActivities.filter(item => item.amount > 0))
              )}
            </div>
            <div className="text-sm text-slate-600">Total Cash Inflows</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-rose-50/50 to-rose-100/30 rounded-2xl border border-rose-200 p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-rose-600">
              {formatCurrency(
                calculateTotalAbs(cashFlowData.operatingActivities.filter(item => item.amount < 0)) +
                calculateTotalAbs(cashFlowData.investingActivities.filter(item => item.amount < 0)) +
                calculateTotalAbs(cashFlowData.financingActivities.filter(item => item.amount < 0))
              )}
            </div>
            <div className="text-sm text-slate-600">Total Cash Outflows</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-2xl border border-emerald-200 p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(
                cashFlowData.operatingActivities.reduce((sum, item) => sum + item.amount, 0) +
                cashFlowData.investingActivities.reduce((sum, item) => sum + item.amount, 0) +
                cashFlowData.financingActivities.reduce((sum, item) => sum + item.amount, 0)
              )}
            </div>
            <div className="text-sm text-slate-600">Net Change in Cash</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render custom reports
  const renderCustomReports = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {customReports.map((report) => (
          <div key={report.id} className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{report.name}</h3>
                <p className="text-sm text-slate-600">{report.description}</p>
              </div>
              <span className="px-3 py-1 text-xs font-semibold bg-blue2/10 text-blue2 rounded-xl border border-blue2/20">
                Custom
              </span>
            </div>
            
            <div className="mb-4">
              <div className="text-xs text-slate-500 mb-2">Report Fields</div>
              <div className="flex flex-wrap gap-2">
                {report.fields.map((field, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                    {field}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <div className="text-xs text-slate-500 mb-2">Available Filters</div>
              <div className="flex flex-wrap gap-2">
                {report.filters.map((filter, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-blue2/5 text-blue2 rounded-lg border border-blue2/20">
                    {filter}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-500">
                Created by {report.createdBy} • Last run: {report.lastRun}
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs bg-blue2 text-white rounded-lg hover:bg-blue2/90 transition-colors">
                  Run Report
                </button>
                <button className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Create New Report */}
      <div className="bg-gradient-to-r from-blue2/10 to-blue2/5 rounded-2xl border border-blue2/20 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
              <i className="fas fa-plus text-xl text-blue2"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Create Custom Report</h3>
              <p className="text-sm text-slate-600">Build your own report with custom fields and filters</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-blue2 text-white font-medium rounded-xl hover:bg-blue2/90 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2">
            <i className="fas fa-magic"></i>
            Create New Report
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="relative mb-8 md:mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-blue2/90 via-blue2/80 to-blue2/90 text-white p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/20"></div>
          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <i className="fas fa-chart-bar text-3xl text-white/90"></i>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Financial Reports
            </h1>
            <p className="text-slate-200/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Comprehensive financial statements and custom reporting for your business
            </p>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('balance-sheet')}
              className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'balance-sheet' 
                  ? 'bg-white text-blue2 border border-slate-200 shadow-lg' 
                  : 'text-slate-500 hover:text-blue2 hover:bg-white/50 border border-transparent'
              }`}
            >
              <i className="fas fa-balance-scale"></i>
              Balance Sheet
            </button>
            <button
              onClick={() => setActiveTab('profit-loss')}
              className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'profit-loss' 
                  ? 'bg-white text-blue2 border border-slate-200 shadow-lg' 
                  : 'text-slate-500 hover:text-blue2 hover:bg-white/50 border border-transparent'
              }`}
            >
              <i className="fas fa-chart-line"></i>
              Profit & Loss
            </button>
            <button
              onClick={() => setActiveTab('cash-flow')}
              className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'cash-flow' 
                  ? 'bg-white text-blue2 border border-slate-200 shadow-lg' 
                  : 'text-slate-500 hover:text-blue2 hover:bg-white/50 border border-transparent'
              }`}
            >
              <i className="fas fa-exchange-alt"></i>
              Cash Flow
            </button>
            <button
              onClick={() => setActiveTab('custom-reports')}
              className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'custom-reports' 
                  ? 'bg-white text-blue2 border border-slate-200 shadow-lg' 
                  : 'text-slate-500 hover:text-blue2 hover:bg-white/50 border border-transparent'
              }`}
            >
              <i className="fas fa-cog"></i>
              Custom Reports
            </button>
          </div>
        </div>

        {/* Report Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-blue2">
              <i className="fas fa-calendar-alt"></i>
              <span>Report Period: {dateRange}</span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue2 focus:border-blue2 transition-all duration-200"
              >
                <option value="2024">Year 2024</option>
                <option value="2023">Year 2023</option>
                <option value="2022">Year 2022</option>
                <option value="quarter">Current Quarter</option>
                <option value="month">Current Month</option>
              </select>
              
              <select
                value={comparisonPeriod}
                onChange={(e) => setComparisonPeriod(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue2 focus:border-blue2 transition-all duration-200"
              >
                <option value="previous-year">vs Previous Year</option>
                <option value="previous-quarter">vs Previous Quarter</option>
                <option value="budget">vs Budget</option>
                <option value="forecast">vs Forecast</option>
              </select>
              
              <button className="px-4 py-2.5 bg-blue2 text-white text-sm font-medium rounded-xl hover:bg-blue2/90 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg">
                <i className="fas fa-file-export"></i>
                Export Report
              </button>
              
              <button className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg">
                <i className="fas fa-print"></i>
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="mb-6">
          {activeTab === 'balance-sheet' && renderBalanceSheet()}
          {activeTab === 'profit-loss' && renderProfitLoss()}
          {activeTab === 'cash-flow' && renderCashFlow()}
          {activeTab === 'custom-reports' && renderCustomReports()}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue2/10 to-blue2/5 rounded-2xl border border-blue2/20 p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue2">$643,000</div>
              <div className="text-sm text-slate-600">Total Assets</div>
              <div className="text-xs text-emerald-600 mt-2 flex items-center justify-center gap-1">
                <i className="fas fa-arrow-up"></i>
                12.5% growth
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-2xl border border-emerald-200 p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">$128,000</div>
              <div className="text-sm text-slate-600">Net Profit</div>
              <div className="text-xs text-emerald-600 mt-2 flex items-center justify-center gap-1">
                <i className="fas fa-arrow-up"></i>
                18.4% growth
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50/50 to-purple-100/30 rounded-2xl border border-purple-200 p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">24.8%</div>
              <div className="text-sm text-slate-600">Profit Margin</div>
              <div className="text-xs text-emerald-600 mt-2 flex items-center justify-center gap-1">
                <i className="fas fa-arrow-up"></i>
                2.1% improvement
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-rose-50/50 to-rose-100/30 rounded-2xl border border-rose-200 p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-rose-600">$43,000</div>
              <div className="text-sm text-slate-600">Operating Cash Flow</div>
              <div className="text-xs text-emerald-600 mt-2 flex items-center justify-center gap-1">
                <i className="fas fa-arrow-up"></i>
                15.7% increase
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;