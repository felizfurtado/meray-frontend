import React, { useState, useRef } from 'react';

const BankReconciliation = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([
    {
      id: '1',
      name: 'Main Business Account',
      bank: 'Emirates NBD',
      accountNumber: '1234-5678-9012',
      currentBalance: 105000,
      ledgerBalance: 105000,
      status: 'reconciled',
      lastReconciled: '2024-11-20',
      color: '#3B82F6'
    },
    {
      id: '2',
      name: 'Payroll Account',
      bank: 'Mashreq Bank',
      accountNumber: '9876-5432-1098',
      currentBalance: 45000,
      ledgerBalance: 45000,
      status: 'reconciled',
      lastReconciled: '2024-11-20',
      color: '#10B981'
    },
    {
      id: '3',
      name: 'Savings Account',
      bank: 'ADCB',
      accountNumber: '5555-6666-7777',
      currentBalance: 125000,
      ledgerBalance: 124900,
      status: 'discrepancy',
      lastReconciled: '2024-11-15',
      color: '#8B5CF6'
    },
    {
      id: '4',
      name: 'Petty Cash',
      bank: 'Cash',
      accountNumber: 'CASH-001',
      currentBalance: 5000,
      ledgerBalance: 5000,
      status: 'pending',
      lastReconciled: '2024-11-10',
      color: '#F59E0B'
    }
  ]);

  const [transactions, setTransactions] = useState([
    {
      id: '1',
      accountId: '1',
      date: '2024-11-21',
      description: 'Invoice 1234 - John Smith',
      amount: 24000,
      type: 'credit',
      bankStatus: 'matched',
      ledgerStatus: 'matched',
      category: 'Accounts Receivable',
      reference: 'INV-1234'
    },
    {
      id: '2',
      accountId: '1',
      date: '2024-11-23',
      description: 'Expense for Goodl Restaurant',
      amount: 7150,
      type: 'debit',
      bankStatus: 'potential-match',
      ledgerStatus: 'potential-match',
      category: 'Meal Expense',
      reference: 'EXP-7890'
    },
    {
      id: '3',
      accountId: '1',
      date: '2024-11-23',
      description: 'SmartPower station fee',
      amount: 900,
      type: 'debit',
      bankStatus: 'matched',
      ledgerStatus: 'matched',
      category: 'Utilities',
      reference: 'UTIL-456'
    },
    {
      id: '4',
      accountId: '1',
      date: '2024-11-25',
      description: 'Bank Fee',
      amount: 50,
      type: 'debit',
      bankStatus: 'not-matched',
      ledgerStatus: 'not-matched',
      category: 'Bank Charges',
      reference: 'FEE-001'
    },
    {
      id: '5',
      accountId: '1',
      date: '2024-11-26',
      description: 'Supplier Payment - Tech Supplies',
      amount: 12500,
      type: 'debit',
      bankStatus: 'matched',
      ledgerStatus: 'matched',
      category: 'Accounts Payable',
      reference: 'PAY-5678'
    },
    {
      id: '6',
      accountId: '3',
      date: '2024-11-27',
      description: 'Interest Earned',
      amount: 500,
      type: 'credit',
      bankStatus: 'not-matched',
      ledgerStatus: 'matched',
      category: 'Interest Income',
      reference: 'INT-789'
    }
  ]);

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    bank: '',
    accountNumber: '',
    currentBalance: '',
    currency: 'AED'
  });

  const fileInputRef = useRef(null);

  // Calculate reconciliation status
  const calculateReconciliation = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return { matched: 0, pending: 0, total: 0, difference: 0 };

    const accountTransactions = transactions.filter(t => t.accountId === accountId);
    const matched = accountTransactions.filter(t => t.bankStatus === 'matched' && t.ledgerStatus === 'matched').length;
    const pending = accountTransactions.filter(t => 
      t.bankStatus === 'potential-match' || 
      t.ledgerStatus === 'potential-match' || 
      t.bankStatus === 'not-matched' || 
      t.ledgerStatus === 'not-matched'
    ).length;

    const bankTotal = accountTransactions
      .filter(t => t.bankStatus === 'matched' || t.bankStatus === 'potential-match')
      .reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), account.currentBalance);

    const ledgerTotal = accountTransactions
      .filter(t => t.ledgerStatus === 'matched' || t.ledgerStatus === 'potential-match')
      .reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), account.ledgerBalance);

    const difference = bankTotal - ledgerTotal;

    return {
      matched,
      pending,
      total: accountTransactions.length,
      difference,
      bankTotal,
      ledgerTotal
    };
  };

  // Handle bank statement upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Simulate CSV parsing
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvContent = event.target.result;
        // Here you would parse the CSV and match transactions
        // For now, we'll just simulate successful upload
        alert(`Bank statement uploaded successfully: ${file.name}\nParsing and matching transactions...`);
        
        // Simulate matching logic
        setTimeout(() => {
          // Update some transactions to show matching
          setTransactions(prev => prev.map(t => 
            t.accountId === selectedAccount?.id && t.bankStatus === 'not-matched'
              ? { ...t, bankStatus: 'potential-match' }
              : t
          ));
        }, 1000);
      } catch (error) {
        alert('Error reading CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  // Add new bank account
  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.bank || !newAccount.accountNumber) {
      alert('Please fill in all required fields');
      return;
    }

    const newAccountObj = {
      id: Date.now().toString(),
      name: newAccount.name,
      bank: newAccount.bank,
      accountNumber: newAccount.accountNumber,
      currentBalance: parseFloat(newAccount.currentBalance) || 0,
      ledgerBalance: parseFloat(newAccount.currentBalance) || 0,
      status: 'pending',
      lastReconciled: new Date().toISOString().split('T')[0],
      color: '#6B7280'
    };

    setAccounts(prev => [...prev, newAccountObj]);
    setNewAccount({
      name: '',
      bank: '',
      accountNumber: '',
      currentBalance: '',
      currency: 'AED'
    });
    setShowAddAccount(false);
  };

  // Reconcile transaction
  const handleReconcile = (transactionId, type) => {
    setTransactions(prev => prev.map(t => 
      t.id === transactionId 
        ? { 
            ...t, 
            bankStatus: type === 'bank' ? 'matched' : t.bankStatus,
            ledgerStatus: type === 'ledger' ? 'matched' : t.ledgerStatus
          }
        : t
    ));
  };

  // Filter transactions by account
  const filteredTransactions = selectedAccount 
    ? transactions.filter(t => t.accountId === selectedAccount.id)
    : transactions;

  // Get status badge color
  const getStatusBadge = (status) => {
    switch(status) {
      case 'reconciled':
        return 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200';
      case 'pending':
        return 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200';
      case 'discrepancy':
        return 'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // Get transaction status badge
  const getTransactionStatusBadge = (status) => {
    switch(status) {
      case 'matched':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'potential-match':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'not-matched':
        return 'bg-rose-100 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="relative mb-8 md:mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-blue2/90 via-blue2/80 to-blue2/90 text-white p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/20"></div>
          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <i className="fas fa-university text-3xl text-white/90"></i>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Bank Account Reconciliation
            </h1>
            <p className="text-slate-200/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Automatically match bank statements with accounting entries and identify discrepancies
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'overview' 
                  ? 'bg-white text-blue2 border border-slate-200 shadow-lg' 
                  : 'text-slate-500 hover:text-blue2 hover:bg-white/50 border border-transparent'
              }`}
            >
              <i className="fas fa-chart-pie"></i>
              Overview
            </button>
            <button
              onClick={() => setActiveTab('reconciliation')}
              className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'reconciliation' 
                  ? 'bg-white text-blue2 border border-slate-200 shadow-lg' 
                  : 'text-slate-500 hover:text-blue2 hover:bg-white/50 border border-transparent'
              }`}
            >
              <i className="fas fa-exchange-alt"></i>
              Reconciliation
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'transactions' 
                  ? 'bg-white text-blue2 border border-slate-200 shadow-lg' 
                  : 'text-slate-500 hover:text-blue2 hover:bg-white/50 border border-transparent'
              }`}
            >
              <i className="fas fa-list-alt"></i>
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'reports' 
                  ? 'bg-white text-blue2 border border-slate-200 shadow-lg' 
                  : 'text-slate-500 hover:text-blue2 hover:bg-white/50 border border-transparent'
              }`}
            >
              <i className="fas fa-file-alt"></i>
              Reports
            </button>
          </div>
        </div>

        {/* Main Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
                <div className="text-2xl font-bold text-blue2">4</div>
                <div className="text-sm text-slate-600 mt-1">Bank Accounts</div>
                <div className="text-xs text-emerald-600 mt-3 flex items-center gap-2">
                  <i className="fas fa-check-circle"></i>
                  All active
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-emerald-400"></div>
                <div className="text-2xl font-bold text-blue2">3</div>
                <div className="text-sm text-slate-600 mt-1">Reconciled Accounts</div>
                <div className="text-xs text-emerald-600 mt-3 flex items-center gap-2">
                  <i className="fas fa-arrow-up"></i>
                  75% reconciled
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-purple-400"></div>
                <div className="text-2xl font-bold text-blue2">AED 120,900</div>
                <div className="text-sm text-slate-600 mt-1">Total Bank Balance</div>
                <div className="text-xs text-blue2 mt-3 flex items-center gap-2">
                  <i className="fas fa-balance-scale"></i>
                  Across all accounts
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-amber-400"></div>
                <div className="text-2xl font-bold text-blue2">AED 100</div>
                <div className="text-sm text-slate-600 mt-1">Total Discrepancy</div>
                <div className="text-xs text-rose-600 mt-3 flex items-center gap-2">
                  <i className="fas fa-exclamation-triangle"></i>
                  Needs attention
                </div>
              </div>
            </div>

            {/* Bank Accounts */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                    <i className="fas fa-university text-xl text-blue2"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Bank Accounts</h2>
                    <p className="text-sm text-slate-500">Manage and reconcile your bank accounts</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddAccount(true)}
                  className="px-4 py-2 bg-blue2 text-white text-sm font-medium rounded-xl hover:bg-blue2/90 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <i className="fas fa-plus"></i>
                  Add Account
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {accounts.map((account) => {
                  const recon = calculateReconciliation(account.id);
                  return (
                    <div 
                      key={account.id}
                      onClick={() => {
                        setSelectedAccount(account);
                        setActiveTab('reconciliation');
                      }}
                      className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden group"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: account.color }}></div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="font-semibold text-slate-900">{account.name}</div>
                          <div className="text-sm text-slate-500 mt-1">{account.bank}</div>
                          <div className="text-xs text-slate-400 mt-1">{account.accountNumber}</div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-xl ${getStatusBadge(account.status)}`}>
                          {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-slate-600">Current Balance</div>
                          <div className="text-lg font-bold text-slate-900">AED {account.currentBalance.toLocaleString()}</div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="text-slate-600">Reconciliation</div>
                          <div className="font-medium text-slate-900">{recon.matched}/{recon.total}</div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${(recon.matched / recon.total) * 100}%` }}
                          ></div>
                        </div>
                        
                        {recon.difference !== 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="text-slate-600">Difference</div>
                            <div className={`font-medium ${recon.difference > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              AED {Math.abs(recon.difference).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue2/10 to-blue2/5 rounded-2xl border border-blue2/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                    <i className="fas fa-file-upload text-xl text-blue2"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Upload Bank Statement</h3>
                    <p className="text-sm text-slate-500">CSV format supported</p>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 bg-blue2 text-white text-sm font-medium rounded-xl hover:bg-blue2/90 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <i className="fas fa-cloud-upload-alt"></i>
                  Upload CSV Statement
                </button>
              </div>

              <div className="bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-2xl border border-emerald-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                    <i className="fas fa-sync-alt text-xl text-emerald-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Auto Reconciliation</h3>
                    <p className="text-sm text-slate-500">Match transactions automatically</p>
                  </div>
                </div>
                <button className="w-full px-4 py-3 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  <i className="fas fa-magic"></i>
                  Run Auto-Match
                </button>
              </div>

              <div className="bg-gradient-to-r from-purple-50/50 to-purple-100/30 rounded-2xl border border-purple-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center">
                    <i className="fas fa-file-pdf text-xl text-purple-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Reconciliation Report</h3>
                    <p className="text-sm text-slate-500">Generate detailed reports</p>
                  </div>
                </div>
                <button className="w-full px-4 py-3 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  <i className="fas fa-download"></i>
                  Download Report
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reconciliation' && (
          <div className="space-y-6">
            {/* Account Selection */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                    <i className="fas fa-exchange-alt text-xl text-blue2"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Bank Reconciliation</h2>
                    <p className="text-sm text-slate-500">Match bank statement transactions with accounting entries</p>
                  </div>
                </div>
                
                <select
                  value={selectedAccount?.id || ''}
                  onChange={(e) => {
                    const account = accounts.find(acc => acc.id === e.target.value);
                    setSelectedAccount(account || null);
                  }}
                  className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue2 focus:border-blue2 transition-all duration-200 appearance-none bg-white"
                >
                  <option value="">Select Bank Account</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {account.bank}
                    </option>
                  ))}
                </select>
              </div>

              {selectedAccount ? (
                <>
                  {/* Account Summary */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue2/5 to-blue2/10 rounded-xl border border-blue2/20">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-slate-600">Account</div>
                        <div className="font-semibold text-slate-900">{selectedAccount.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600">Bank Statement Balance</div>
                        <div className="font-semibold text-slate-900">
                          AED {selectedAccount.currentBalance.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600">Ledger Balance</div>
                        <div className="font-semibold text-slate-900">
                          AED {selectedAccount.ledgerBalance.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600">Difference</div>
                        <div className={`font-semibold ${selectedAccount.status === 'discrepancy' ? 'text-rose-600' : 'text-emerald-600'}`}>
                          AED {Math.abs(selectedAccount.currentBalance - selectedAccount.ledgerBalance).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reconciliation Tables */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Bank Statement */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-400"></div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          <i className="fas fa-university text-blue2"></i>
                          Bank Statement
                        </h3>
                        <span className="text-xs text-slate-500">Uploaded: Today</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                          <span className="text-sm font-medium text-slate-700">Beginning Balance</span>
                          <span className="text-sm font-medium text-slate-900">AED 105,000</span>
                        </div>
                        
                        {filteredTransactions.map(transaction => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-900">{transaction.description}</div>
                              <div className="text-xs text-slate-500 mt-1">{transaction.date} • {transaction.reference}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={`text-sm font-medium ${transaction.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {transaction.type === 'credit' ? '+' : '-'}AED {transaction.amount.toLocaleString()}
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-lg ${getTransactionStatusBadge(transaction.bankStatus)}`}>
                                {transaction.bankStatus.replace('-', ' ')}
                              </span>
                              {transaction.bankStatus !== 'matched' && (
                                <button
                                  onClick={() => handleReconcile(transaction.id, 'bank')}
                                  className="px-2 py-1 text-xs bg-blue2 text-white rounded-lg hover:bg-blue2/90 transition-colors"
                                >
                                  Match
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                          <span className="text-sm font-medium text-slate-700">Ending Balance</span>
                          <span className="text-sm font-bold text-slate-900">AED 120,900</span>
                        </div>
                      </div>
                    </div>

                    {/* Accounting Entries */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-emerald-400"></div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          <i className="fas fa-book text-emerald-600"></i>
                          Accounting Entries
                        </h3>
                        <span className="text-xs text-slate-500">From Chart of Accounts</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                          <span className="text-sm font-medium text-slate-700">Beginning Balance</span>
                          <span className="text-sm font-medium text-slate-900">AED 105,000</span>
                        </div>
                        
                        {filteredTransactions.map(transaction => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-900">
                                {transaction.type === 'credit' ? 'Cash Inflow' : 'Cash Outflow'} - {transaction.category}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">{transaction.date} • {transaction.reference}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={`text-sm font-medium ${transaction.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {transaction.type === 'credit' ? '+' : '-'}AED {transaction.amount.toLocaleString()}
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-lg ${getTransactionStatusBadge(transaction.ledgerStatus)}`}>
                                {transaction.ledgerStatus.replace('-', ' ')}
                              </span>
                              {transaction.ledgerStatus !== 'matched' && (
                                <button
                                  onClick={() => handleReconcile(transaction.id, 'ledger')}
                                  className="px-2 py-1 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                  Match
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                          <span className="text-sm font-medium text-slate-700">Ending Balance</span>
                          <span className="text-sm font-bold text-slate-900">AED 120,800</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Difference Summary */}
                  <div className="bg-gradient-to-r from-rose-50/50 to-rose-100/30 rounded-2xl border border-rose-200 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center">
                          <i className="fas fa-exclamation-triangle text-rose-600"></i>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">Reconciliation Difference</h4>
                          <p className="text-sm text-slate-600">Bank statement vs accounting entries</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-rose-600">AED 100</div>
                        <div className="text-sm text-slate-600">Needs investigation</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                    <i className="fas fa-university text-2xl text-blue2"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a Bank Account</h3>
                  <p className="text-slate-600">Choose a bank account to start reconciliation</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                    <i className="fas fa-list-alt text-xl text-blue2"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Transaction History</h2>
                    <p className="text-sm text-slate-500">All reconciled and unreconciled transactions</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <select className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm">
                    <option>All Accounts</option>
                    {accounts.map(acc => <option key={acc.id}>{acc.name}</option>)}
                  </select>
                  <select className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm">
                    <option>All Status</option>
                    <option>Matched</option>
                    <option>Pending</option>
                    <option>Unmatched</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bank Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ledger Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {transactions.map(transaction => {
                      const account = accounts.find(acc => acc.id === transaction.accountId);
                      return (
                        <tr key={transaction.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">{transaction.date}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-900">{transaction.description}</div>
                            <div className="text-xs text-slate-500">{transaction.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">{account?.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${transaction.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {transaction.type === 'credit' ? '+' : '-'}AED {transaction.amount.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-xl ${getTransactionStatusBadge(transaction.bankStatus)}`}>
                              {transaction.bankStatus.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-xl ${getTransactionStatusBadge(transaction.ledgerStatus)}`}>
                              {transaction.ledgerStatus.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleReconcile(transaction.id, 'bank')}
                              className="px-3 py-1 text-xs bg-blue2 text-white rounded-lg hover:bg-blue2/90 transition-colors mr-2"
                            >
                              Match
                            </button>
                            <button className="px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors">
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Add Account Modal */}
        {showAddAccount && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Add Bank Account</h3>
                  <button
                    onClick={() => setShowAddAccount(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Account Name *
                    </label>
                    <input
                      type="text"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                      placeholder="e.g., Main Business Account"
                      className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={newAccount.bank}
                      onChange={(e) => setNewAccount({...newAccount, bank: e.target.value})}
                      placeholder="e.g., Emirates NBD"
                      className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={newAccount.accountNumber}
                      onChange={(e) => setNewAccount({...newAccount, accountNumber: e.target.value})}
                      placeholder="e.g., 1234-5678-9012"
                      className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Opening Balance
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={newAccount.currency}
                        onChange={(e) => setNewAccount({...newAccount, currency: e.target.value})}
                        className="px-3 py-2 border border-slate-300 rounded-xl text-sm"
                      >
                        <option>AED</option>
                        <option>USD</option>
                        <option>EUR</option>
                      </select>
                      <input
                        type="number"
                        value={newAccount.currentBalance}
                        onChange={(e) => setNewAccount({...newAccount, currentBalance: e.target.value})}
                        placeholder="0.00"
                        className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddAccount(false)}
                    className="flex-1 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAccount}
                    className="flex-1 px-4 py-2 bg-blue2 text-white rounded-xl hover:bg-blue2/90 transition-colors"
                  >
                    Add Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankReconciliation;