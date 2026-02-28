import React, { useState } from 'react';

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState([
    {
      id: '1',
      code: '1000',
      name: 'Current Assets',
      type: 'Asset',
      description: 'Assets expected to be converted to cash within one year',
      vatApplicable: 'No',
      isParent: true,
      parentCode: null,
      children: ['1001', '1020', '1050', '1060'],
      level: 0,
      bold: true,
      balance: 0,
      color: '#3B82F6'
    },
    {
      id: '2',
      code: '1001',
      name: 'Cash and Cash Equivalents',
      type: 'Asset',
      description: 'Cash on hand and in bank accounts',
      vatApplicable: 'No',
      isParent: true,
      parentCode: '1000',
      children: ['1002', '1003', '1004'],
      level: 1,
      bold: true,
      balance: 50000,
      color: '#60A5FA'
    },
    {
      id: '3',
      code: '1002',
      name: 'Petty Cash',
      type: 'Asset',
      description: 'Small amounts of cash kept on hand for minor expenses',
      vatApplicable: 'No',
      isParent: false,
      parentCode: '1001',
      children: [],
      level: 2,
      bold: false,
      balance: 5000,
      color: '#93C5FD'
    },
    {
      id: '4',
      code: '1003',
      name: 'Bank - Current Account',
      type: 'Asset',
      description: 'Primary business checking account',
      vatApplicable: 'No',
      isParent: false,
      parentCode: '1001',
      children: [],
      level: 2,
      bold: false,
      balance: 45000,
      color: '#93C5FD'
    },
    {
      id: '5',
      code: '1020',
      name: 'Accounts Receivable',
      type: 'Asset',
      description: 'Net amounts due from customers',
      vatApplicable: 'No',
      isParent: true,
      parentCode: '1000',
      children: ['1021', '1022'],
      level: 1,
      bold: true,
      balance: 0,
      color: '#10B981'
    },
    {
      id: '6',
      code: '1021',
      name: 'Trade Receivables',
      type: 'Asset',
      description: 'Gross amounts due from customers',
      vatApplicable: 'Yes',
      isParent: false,
      parentCode: '1020',
      children: [],
      level: 2,
      bold: false,
      balance: 85000,
      color: '#34D399'
    },
    {
      id: '7',
      code: '1022',
      name: 'Allowance for Doubtful Accounts',
      type: 'Asset',
      description: 'Contra-asset account for estimated uncollectible receivables',
      vatApplicable: 'No',
      isParent: false,
      parentCode: '1020',
      children: [],
      level: 2,
      bold: false,
      balance: -5000,
      color: '#34D399'
    },
    {
      id: '8',
      code: '1050',
      name: 'Inventory',
      type: 'Asset',
      description: 'Goods held for sale in the ordinary course of business',
      vatApplicable: 'Yes',
      isParent: false,
      parentCode: '1000',
      children: [],
      level: 1,
      bold: true,
      balance: 35000,
      color: '#F59E0B'
    },
    {
      id: '9',
      code: '1060',
      name: 'Prepaid Expenses',
      type: 'Asset',
      description: 'Expenses paid in advance',
      vatApplicable: 'No',
      isParent: false,
      parentCode: '1000',
      children: [],
      level: 1,
      bold: true,
      balance: 12000,
      color: '#F59E0B'
    },
    {
      id: '10',
      code: '2000',
      name: 'Non-Current Assets',
      type: 'Asset',
      description: 'Long-term assets not expected to be converted to cash within one year',
      vatApplicable: 'No',
      isParent: true,
      parentCode: null,
      children: ['2010', '2020'],
      level: 0,
      bold: true,
      balance: 0,
      color: '#8B5CF6'
    },
    {
      id: '11',
      code: '2010',
      name: 'Property, Plant & Equipment',
      type: 'Asset',
      description: 'Tangible long-term assets used in operations',
      vatApplicable: 'Yes',
      isParent: true,
      parentCode: '2000',
      children: ['2011', '2012'],
      level: 1,
      bold: true,
      balance: 0,
      color: '#A78BFA'
    },
    {
      id: '12',
      code: '2011',
      name: 'Office Equipment',
      type: 'Asset',
      description: 'Computers, furniture, and other office equipment',
      vatApplicable: 'Yes',
      isParent: false,
      parentCode: '2010',
      children: [],
      level: 2,
      bold: false,
      balance: 25000,
      color: '#C4B5FD'
    },
    {
      id: '13',
      code: '2012',
      name: 'Accumulated Depreciation',
      type: 'Asset',
      description: 'Contra-asset account for depreciation',
      vatApplicable: 'No',
      isParent: false,
      parentCode: '2010',
      children: [],
      level: 2,
      bold: false,
      balance: -5000,
      color: '#C4B5FD'
    },
    {
      id: '14',
      code: '3000',
      name: 'Current Liabilities',
      type: 'Liability',
      description: 'Obligations due within one year',
      vatApplicable: 'No',
      isParent: true,
      parentCode: null,
      children: ['3010', '3020'],
      level: 0,
      bold: true,
      balance: 0,
      color: '#EF4444'
    },
    {
      id: '15',
      code: '3010',
      name: 'Accounts Payable',
      type: 'Liability',
      description: 'Amounts owed to suppliers and vendors',
      vatApplicable: 'Yes',
      isParent: false,
      parentCode: '3000',
      children: [],
      level: 1,
      bold: true,
      balance: 28000,
      color: '#F87171'
    },
    {
      id: '16',
      code: '3020',
      name: 'Short-term Loans',
      type: 'Liability',
      description: 'Loans payable within one year',
      vatApplicable: 'No',
      isParent: false,
      parentCode: '3000',
      children: [],
      level: 1,
      bold: true,
      balance: 15000,
      color: '#F87171'
    },
    {
      id: '17',
      code: '4000',
      name: 'Equity',
      type: 'Equity',
      description: "Owner's interest in the business",
      vatApplicable: 'No',
      isParent: true,
      parentCode: null,
      children: ['4010', '4020'],
      level: 0,
      bold: true,
      balance: 0,
      color: '#6366F1'
    },
    {
      id: '18',
      code: '4010',
      name: 'Share Capital',
      type: 'Equity',
      description: 'Capital contributed by shareholders',
      vatApplicable: 'No',
      isParent: false,
      parentCode: '4000',
      children: [],
      level: 1,
      bold: true,
      balance: 100000,
      color: '#818CF8'
    },
    {
      id: '19',
      code: '5000',
      name: 'Revenue',
      type: 'Revenue',
      description: 'Income from primary business activities',
      vatApplicable: 'Yes',
      isParent: true,
      parentCode: null,
      children: ['5010', '5020'],
      level: 0,
      bold: true,
      balance: 0,
      color: '#10B981'
    },
    {
      id: '20',
      code: '5010',
      name: 'Sales Revenue',
      type: 'Revenue',
      description: 'Revenue from product sales',
      vatApplicable: 'Yes',
      isParent: false,
      parentCode: '5000',
      children: [],
      level: 1,
      bold: true,
      balance: 250000,
      color: '#34D399'
    }
  ]);

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showHierarchy, setShowHierarchy] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    code: '',
    name: '',
    type: 'Asset',
    description: '',
    vatApplicable: 'No',
    parentCode: '',
    isParent: false
  });

  // Calculate balances for parent accounts
  const calculateParentBalances = () => {
    const updatedAccounts = [...accounts];
    
    // Calculate parent balances by summing children
    updatedAccounts.forEach(account => {
      if (account.isParent && account.children.length > 0) {
        const childrenBalances = account.children.map(childCode => {
          const child = updatedAccounts.find(acc => acc.code === childCode);
          return child ? child.balance : 0;
        });
        account.balance = childrenBalances.reduce((sum, balance) => sum + balance, 0);
      }
    });
    
    setAccounts(updatedAccounts);
  };

  // Initialize balances
  useState(() => {
    calculateParentBalances();
  }, []);

  // Get account type color
  const getTypeColor = (type) => {
    switch(type) {
      case 'Asset': return 'bg-blue-100 text-blue-800';
      case 'Liability': return 'bg-red-100 text-red-800';
      case 'Equity': return 'bg-indigo-100 text-indigo-800';
      case 'Revenue': return 'bg-green-100 text-green-800';
      case 'Expense': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get account hierarchy
  const getAccountHierarchy = (accountCode) => {
    const account = accounts.find(acc => acc.code === accountCode);
    if (!account) return { parent: null, children: [] };

    const parent = account.parentCode 
      ? accounts.find(acc => acc.code === account.parentCode)
      : null;

    const children = account.children.map(childCode => 
      accounts.find(acc => acc.code === childCode)
    ).filter(child => child);

    return { account, parent, children };
  };

  // Handle view hierarchy
  const handleViewHierarchy = (accountCode) => {
    setSelectedAccount(accountCode);
    setShowHierarchy(true);
  };

  // Handle add account
  const handleAddAccount = () => {
    if (!newAccount.code || !newAccount.name || !newAccount.type) {
      alert('Please fill in required fields');
      return;
    }

    const newAccountObj = {
      id: Date.now().toString(),
      code: newAccount.code,
      name: newAccount.name,
      type: newAccount.type,
      description: newAccount.description,
      vatApplicable: newAccount.vatApplicable,
      isParent: newAccount.isParent,
      parentCode: newAccount.parentCode || null,
      children: [],
      level: newAccount.parentCode ? 1 : 0,
      bold: !newAccount.parentCode,
      balance: 0,
      color: newAccount.type === 'Asset' ? '#3B82F6' : 
             newAccount.type === 'Liability' ? '#EF4444' : 
             newAccount.type === 'Equity' ? '#6366F1' : 
             newAccount.type === 'Revenue' ? '#10B981' : '#F59E0B'
    };

    // Add to parent's children if parent exists
    if (newAccount.parentCode) {
      setAccounts(prev => prev.map(acc => 
        acc.code === newAccount.parentCode 
          ? { ...acc, children: [...acc.children, newAccount.code], isParent: true }
          : acc
      ));
    }

    setAccounts(prev => [...prev, newAccountObj]);
    setNewAccount({
      code: '',
      name: '',
      type: 'Asset',
      description: '',
      vatApplicable: 'No',
      parentCode: '',
      isParent: false
    });
    setShowAddAccount(false);
    setTimeout(calculateParentBalances, 100);
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(account => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'parents') return account.isParent;
    if (activeFilter === 'children') return account.parentCode;
    if (activeFilter === 'assets') return account.type === 'Asset';
    if (activeFilter === 'liabilities') return account.type === 'Liability';
    if (activeFilter === 'equity') return account.type === 'Equity';
    if (activeFilter === 'revenue') return account.type === 'Revenue';
    return true;
  }).filter(account => 
    account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get parent account options for dropdown
  const parentAccountOptions = accounts.filter(acc => acc.isParent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">


    
        {/* Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                <i className="fas fa-filter text-xl text-blue2"></i>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Account Management</h2>
                <p className="text-sm text-slate-500">View and manage your chart of accounts</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue2 focus:border-blue2 w-full md:w-64"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
              </div>
              
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue2 focus:border-blue2"
              >
                <option value="all">All Accounts</option>
                <option value="parents">Parent Accounts</option>
                <option value="children">Child Accounts</option>
                <option value="assets">Assets</option>
                <option value="liabilities">Liabilities</option>
                <option value="equity">Equity</option>
                <option value="revenue">Revenue</option>
              </select>
              
              <button
                onClick={() => setShowAddAccount(true)}
                className="px-4 py-2.5 bg-blue2 text-white text-sm font-medium rounded-xl hover:bg-blue2/90 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <i className="fas fa-plus"></i>
                Add Account
              </button>
            </div>
          </div>
        </div>

        {/* Chart of Accounts Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden mb-6 relative group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account Code</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">VAT Applicable</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hierarchy</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAccounts.map((account) => (
                  <tr 
                    key={account.id} 
                    className={`hover:bg-slate-50/50 transition-colors ${account.parentCode ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`font-medium ${account.bold ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                        {account.code}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`${account.bold ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                        <div className="flex items-center">
                          {account.level > 0 && (
                            <div className="flex items-center mr-2">
                              {[...Array(account.level)].map((_, i) => (
                                <div key={i} className="w-4 h-px bg-slate-300 mx-1"></div>
                              ))}
                              <i className="fas fa-arrow-right text-xs text-slate-400"></i>
                            </div>
                          )}
                          {account.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${getTypeColor(account.type)}`}>
                        {account.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 max-w-xs">{account.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        account.type === 'Asset' || account.type === 'Revenue' 
                          ? 'text-emerald-600' 
                          : account.type === 'Liability' || account.type === 'Expense'
                          ? 'text-rose-600'
                          : 'text-indigo-600'
                      }`}>
                        AED {account.balance.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${
                        account.vatApplicable === 'Yes' 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {account.vatApplicable}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewHierarchy(account.code)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 hover:shadow-md ${
                          account.isParent
                            ? 'bg-blue2 text-white hover:bg-blue2/90'
                            : 'bg-blue2/20 text-blue2 hover:bg-blue2/30'
                        }`}
                      >
                        <i className={`fas fa-${account.isParent ? 'sitemap' : 'link'} mr-1`}></i>
                        {account.isParent ? 'Parent' : 'Child'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                          Edit
                        </button>
                        <button className="px-3 py-1 text-xs bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hierarchy Modal */}
        {showHierarchy && selectedAccount && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                      <i className="fas fa-sitemap text-xl text-blue2"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Account Hierarchy</h3>
                      <p className="text-sm text-slate-500">Parent-child relationship view</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowHierarchy(false);
                      setSelectedAccount(null);
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                {(() => {
                  const { account, parent, children } = getAccountHierarchy(selectedAccount);
                  return (
                    <div className="space-y-6">
                      {/* Selected Account */}
                      <div className="bg-gradient-to-r from-blue2/10 to-blue2/5 rounded-2xl border border-blue2/20 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-sm text-slate-500">Selected Account</div>
                            <div className="text-lg font-semibold text-slate-900">{account.code} - {account.name}</div>
                          </div>
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${getTypeColor(account.type)}`}>
                            {account.type}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600">{account.description}</div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-slate-500">Current Balance</div>
                            <div className="text-lg font-bold text-slate-900">AED {account.balance.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-500">VAT Status</div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-xl ${
                              account.vatApplicable === 'Yes' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {account.vatApplicable}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Parent Account */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
                          <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <i className="fas fa-level-up-alt text-blue2"></i>
                            Parent Account
                          </h4>
                          {parent ? (
                            <div className="space-y-3">
                              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                                <div className="text-sm font-medium text-slate-900">{parent.code} - {parent.name}</div>
                                <div className="text-xs text-slate-500 mt-1">{parent.type}</div>
                                <div className="mt-2 text-sm text-slate-700">
                                  Balance: <span className="font-medium">AED {parent.balance.toLocaleString()}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleViewHierarchy(parent.code)}
                                className="w-full px-3 py-2 text-sm bg-blue2 text-white rounded-xl hover:bg-blue2/90 transition-colors flex items-center justify-center gap-2"
                              >
                                <i className="fas fa-eye"></i>
                                View Parent Details
                              </button>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 flex items-center justify-center">
                                <i className="fas fa-times text-slate-400"></i>
                              </div>
                              <div className="text-sm text-slate-600">No Parent Account</div>
                              <div className="text-xs text-slate-500">This is a top-level account</div>
                            </div>
                          )}
                        </div>
                        
                        {/* Child Accounts */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
                          <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <i className="fas fa-level-down-alt text-emerald-600"></i>
                            Child Accounts ({children.length})
                          </h4>
                          {children.length > 0 ? (
                            <div className="space-y-3">
                              {children.map(child => (
                                <div key={child.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="text-sm font-medium text-slate-900">{child.code} - {child.name}</div>
                                      <div className="text-xs text-slate-500 mt-1">{child.type}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-slate-900">AED {child.balance.toLocaleString()}</div>
                                      <button
                                        onClick={() => handleViewHierarchy(child.code)}
                                        className="mt-1 px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                                      >
                                        View
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium text-slate-900">Total Children Balance</div>
                                  <div className="text-lg font-bold text-emerald-600">
                                    AED {children.reduce((sum, child) => sum + child.balance, 0).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 flex items-center justify-center">
                                <i className="fas fa-times text-slate-400"></i>
                              </div>
                              <div className="text-sm text-slate-600">No Child Accounts</div>
                              <div className="text-xs text-slate-500">This account has no sub-accounts</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Add Account Modal */}
        {showAddAccount && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                      <i className="fas fa-plus text-xl text-blue2"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Add New Account</h3>
                      <p className="text-sm text-slate-500">Create a new account in the chart of accounts</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddAccount(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Account Code *
                      </label>
                      <input
                        type="text"
                        value={newAccount.code}
                        onChange={(e) => setNewAccount({...newAccount, code: e.target.value})}
                        placeholder="e.g., 1021"
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Account Name *
                      </label>
                      <input
                        type="text"
                        value={newAccount.name}
                        onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                        placeholder="e.g., Trade Receivables"
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Account Type *
                      </label>
                      <select
                        value={newAccount.type}
                        onChange={(e) => setNewAccount({...newAccount, type: e.target.value})}
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2"
                      >
                        <option value="Asset">Asset</option>
                        <option value="Liability">Liability</option>
                        <option value="Equity">Equity</option>
                        <option value="Revenue">Revenue</option>
                        <option value="Expense">Expense</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newAccount.description}
                        onChange={(e) => setNewAccount({...newAccount, description: e.target.value})}
                        placeholder="Account description..."
                        rows="3"
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2 resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Parent Account
                      </label>
                      <select
                        value={newAccount.parentCode}
                        onChange={(e) => setNewAccount({...newAccount, parentCode: e.target.value, isParent: false})}
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2"
                      >
                        <option value="">No Parent (Top Level)</option>
                        {parentAccountOptions.map(acc => (
                          <option key={acc.id} value={acc.code}>
                            {acc.code} - {acc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        VAT Applicable
                      </label>
                      <select
                        value={newAccount.vatApplicable}
                        onChange={(e) => setNewAccount({...newAccount, vatApplicable: e.target.value})}
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue2 focus:border-blue2"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddAccount(false)}
                    className="flex-1 px-4 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAccount}
                    className="flex-1 px-4 py-2.5 bg-blue2 text-white rounded-xl hover:bg-blue2/90 transition-colors"
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

export default ChartOfAccounts;