import React, { useState, useMemo } from 'react';

const PipelineDashboard = () => {
  const [activeReport, setActiveReport] = useState('pipeline-funnel');
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedRep, setSelectedRep] = useState('All');
  const [viewMode, setViewMode] = useState('charts');

  // Demo data for pipeline stages
  const pipelineStagesData = [
    { name: 'Lead', value: 156, deals: 156, conversion: '100%', avgValue: 1500, color: '#8B5CF6' },
    { name: 'Contacted', value: 124, deals: 124, conversion: '79%', avgValue: 1800, color: '#3B82F6' },
    { name: 'Qualified', value: 98, deals: 98, conversion: '63%', avgValue: 2200, color: '#10B981' },
    { name: 'Proposal', value: 67, deals: 67, conversion: '43%', avgValue: 3500, color: '#F59E0B' },
    { name: 'Negotiation', value: 42, deals: 42, conversion: '27%', avgValue: 5200, color: '#EF4444' },
    { name: 'Closed Won', value: 28, deals: 28, conversion: '18%', avgValue: 7500, color: '#14B8A6' },
  ];

  // Demo data for leads by source
  const leadsBySourceData = [
    { source: 'Website', leads: 156, converted: 28, conversionRate: '18%', revenue: 210000, color: '#3B82F6' },
    { source: 'Referral', leads: 89, converted: 24, conversionRate: '27%', revenue: 180000, color: '#10B981' },
    { source: 'Social Media', leads: 134, converted: 19, conversionRate: '14%', revenue: 142500, color: '#8B5CF6' },
    { source: 'Email Campaign', leads: 78, converted: 12, conversionRate: '15%', revenue: 90000, color: '#F59E0B' },
    { source: 'Events', leads: 45, converted: 8, conversionRate: '18%', revenue: 60000, color: '#EF4444' },
    { source: 'Other', leads: 32, converted: 5, conversionRate: '16%', revenue: 37500, color: '#6366F1' },
  ];

  // Demo data for sales performance
  const salesReps = ['All', 'Sarah Johnson', 'Michael Chen', 'David Wilson', 'Emma Garcia', 'Robert Kim'];
  const salesPerformanceData = [
    { name: 'Sarah Johnson', dealsClosed: 12, revenue: 285000, winRate: '32%', avgDealSize: 23750, overdueTasks: 3, color: '#3B82F6' },
    { name: 'Michael Chen', dealsClosed: 8, revenue: 210000, winRate: '28%', avgDealSize: 26250, overdueTasks: 1, color: '#10B981' },
    { name: 'David Wilson', dealsClosed: 6, revenue: 145000, winRate: '24%', avgDealSize: 24167, overdueTasks: 5, color: '#8B5CF6' },
    { name: 'Emma Garcia', dealsClosed: 10, revenue: 195000, winRate: '30%', avgDealSize: 19500, overdueTasks: 2, color: '#F59E0B' },
    { name: 'Robert Kim', dealsClosed: 7, revenue: 165000, winRate: '26%', avgDealSize: 23571, overdueTasks: 4, color: '#EF4444' },
  ];

  // Demo data for activity completion
  const activityData = [
    { month: 'Jan', assigned: 145, completed: 128, completionRate: 88 },
    { month: 'Feb', assigned: 156, completed: 142, completionRate: 91 },
    { month: 'Mar', assigned: 178, completed: 165, completionRate: 93 },
    { month: 'Apr', assigned: 189, completed: 174, completionRate: 92 },
    { month: 'May', assigned: 167, completed: 156, completionRate: 93 },
    { month: 'Jun', assigned: 198, completed: 185, completionRate: 93 },
  ];

  // Demo data for revenue forecast
  const forecastData = [
    { month: 'Jan', forecast: 285000, actual: 275000, target: 300000 },
    { month: 'Feb', forecast: 320000, actual: 315000, target: 320000 },
    { month: 'Mar', forecast: 350000, actual: 340000, target: 350000 },
    { month: 'Apr', forecast: 380000, actual: 365000, target: 380000 },
    { month: 'May', forecast: 410000, actual: null, target: 410000 },
    { month: 'Jun', forecast: 450000, actual: null, target: 450000 },
  ];

  // Demo data for top opportunities
  const topOpportunities = [
    { name: 'TechCorp Inc', stage: 'Negotiation', value: 85000, probability: '75%', closeDate: '2024-06-15', rep: 'Sarah Johnson', daysInStage: 14 },
    { name: 'Global Logistics', stage: 'Proposal', value: 65000, probability: '60%', closeDate: '2024-06-30', rep: 'Michael Chen', daysInStage: 21 },
    { name: 'MediHealth Systems', stage: 'Qualified', value: 120000, probability: '40%', closeDate: '2024-07-15', rep: 'Emma Garcia', daysInStage: 7 },
    { name: 'EduTech Solutions', stage: 'Negotiation', value: 45000, probability: '80%', closeDate: '2024-06-10', rep: 'David Wilson', daysInStage: 18 },
    { name: 'RetailPlus Group', stage: 'Proposal', value: 55000, probability: '65%', closeDate: '2024-06-25', rep: 'Robert Kim', daysInStage: 12 },
  ];

  // Demo data for lost deals analysis
  const lostDealsData = [
    { reason: 'Price', count: 12, value: 215000, avgStage: 'Proposal', rep: 'Multiple' },
    { reason: 'Competitor', count: 8, value: 145000, avgStage: 'Negotiation', rep: 'Multiple' },
    { reason: 'Timing', count: 5, value: 85000, avgStage: 'Qualified', rep: 'Multiple' },
    { reason: 'Feature Gap', count: 4, value: 65000, avgStage: 'Proposal', rep: 'Multiple' },
    { reason: 'Budget', count: 7, value: 125000, avgStage: 'Qualified', rep: 'Multiple' },
  ];

  // Filtered data based on selected rep
  const filteredPerformanceData = useMemo(() => {
    if (selectedRep === 'All') return salesPerformanceData;
    return salesPerformanceData.filter(rep => rep.name === selectedRep);
  }, [selectedRep]);

  // Simple chart rendering functions
  const renderBarChart = (data, dataKey, nameKey, color = '#3B82F6') => {
    const maxValue = Math.max(...data.map(item => item[dataKey]));
    
    return (
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-24 text-sm text-slate-600 truncate">{item[nameKey]}</div>
            <div className="flex-1 ml-4">
              <div className="flex items-center">
                <div 
                  className="h-6 rounded-lg transition-all duration-300"
                  style={{ 
                    width: `${(item[dataKey] / maxValue) * 100}%`,
                    backgroundColor: color,
                    opacity: 0.8
                  }}
                ></div>
                <div className="ml-2 text-sm font-medium text-slate-900">
                  {dataKey === 'revenue' || dataKey === 'avgValue' || dataKey === 'value' || dataKey === 'forecast' || dataKey === 'actual' || dataKey === 'target' 
                    ? `$${item[dataKey].toLocaleString()}`
                    : item[dataKey]
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderProgressBar = (percentage, color = '#3B82F6') => {
    return (
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color
          }}
        ></div>
      </div>
    );
  };

  const renderPieChart = (data, dataKey, nameKey) => {
    const total = data.reduce((sum, item) => sum + item[dataKey], 0);
    
    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {(() => {
            let cumulativePercent = 0;
            return data.map((item, index) => {
              const percent = (item[dataKey] / total) * 100;
              const startAngle = cumulativePercent * 3.6;
              const endAngle = (cumulativePercent + percent) * 3.6;
              cumulativePercent += percent;
              
              // Calculate coordinates for pie slice
              const startX = 50 + 40 * Math.cos((startAngle - 90) * (Math.PI / 180));
              const startY = 50 + 40 * Math.sin((startAngle - 90) * (Math.PI / 180));
              const endX = 50 + 40 * Math.cos((endAngle - 90) * (Math.PI / 180));
              const endY = 50 + 40 * Math.sin((endAngle - 90) * (Math.PI / 180));
              
              const largeArcFlag = percent > 50 ? 1 : 0;
              
              return (
                <path
                  key={index}
                  d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="1"
                />
              );
            });
          })()}
          <circle cx="50" cy="50" r="20" fill="white" />
          <text x="50" y="50" textAnchor="middle" dy=".3em" className="text-xs font-medium">
            {total.toLocaleString()}
          </text>
        </svg>
        
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-slate-700">{item[nameKey]}</span>
              <span className="ml-auto font-medium">{((item[dataKey] / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const reports = [
    {
      id: 'pipeline-funnel',
      name: 'Pipeline Funnel',
      description: 'Visualize the stages of your sales pipeline and conversion rates',
      metrics: ['Leads per stage', 'Conversion %', 'Deal value per stage'],
      standard: true,
      custom: false,
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
                <h4 className="font-semibold text-slate-900 mb-4">Pipeline Funnel</h4>
                {renderBarChart(pipelineStagesData, 'deals', 'name')}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-purple-400"></div>
                <h4 className="font-semibold text-slate-900 mb-3">Conversion Funnel</h4>
                <div className="space-y-3">
                  {pipelineStagesData.map((stage, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }}></div>
                        <span className="text-sm text-slate-700">{stage.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">{stage.deals}</div>
                        <div className="text-xs text-slate-500">{stage.conversion}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue2/10 to-blue2/5 rounded-2xl border border-blue2/20 p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue2">18%</div>
                  <div className="text-sm text-slate-600">Overall Conversion Rate</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue2/10 to-blue2/5 rounded-2xl border border-blue2/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-blue2">{pipelineStagesData.reduce((sum, stage) => sum + stage.deals, 0)}</div>
              <div className="text-sm text-slate-600">Total Pipeline Deals</div>
            </div>
            <div className="bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-2xl border border-emerald-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-emerald-600">${pipelineStagesData.reduce((sum, stage) => sum + (stage.deals * stage.avgValue), 0).toLocaleString()}</div>
              <div className="text-sm text-slate-600">Total Pipeline Value</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50/50 to-purple-100/30 rounded-2xl border border-purple-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-purple-600">${pipelineStagesData[pipelineStagesData.length - 1].avgValue.toLocaleString()}</div>
              <div className="text-sm text-slate-600">Avg. Won Deal Value</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'leads-source',
      name: 'Leads by Source',
      description: 'See which lead sources are performing best',
      metrics: ['Number of leads', 'Conversion rate', 'Revenue generated by source'],
      standard: true,
      custom: false,
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
              {renderPieChart(leadsBySourceData, 'leads', 'source')}
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-emerald-400"></div>
              <h4 className="font-semibold text-slate-900 mb-4">Source Performance</h4>
              <div className="space-y-3">
                {leadsBySourceData.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }}></div>
                      <span className="font-medium text-slate-900">{source.source}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900">{source.leads} leads</div>
                      <div className="text-xs text-slate-500">{source.conversionRate} conversion</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue2/10 to-blue2/5 rounded-2xl border border-blue2/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-blue2">{leadsBySourceData.reduce((sum, source) => sum + source.leads, 0)}</div>
              <div className="text-sm text-slate-600">Total Leads</div>
            </div>
            <div className="bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-2xl border border-emerald-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-emerald-600">{leadsBySourceData.reduce((sum, source) => sum + source.converted, 0)}</div>
              <div className="text-sm text-slate-600">Total Converted</div>
            </div>
            <div className="bg-gradient-to-r from-blue2/10 to-blue2/5 rounded-2xl border border-blue2/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-blue2">21%</div>
              <div className="text-sm text-slate-600">Average Conversion</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50/50 to-purple-100/30 rounded-2xl border border-purple-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-purple-600">${leadsBySourceData.reduce((sum, source) => sum + source.revenue, 0).toLocaleString()}</div>
              <div className="text-sm text-slate-600">Total Revenue</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sales-performance',
      name: 'Sales Performance by Rep',
      description: "Evaluate each salesperson's performance",
      metrics: ['Deals closed', 'Revenue generated', 'Win rate', 'Overdue tasks'],
      standard: true,
      custom: false,
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
              <h4 className="font-semibold text-slate-900 mb-4">Deals Closed vs Revenue</h4>
              {renderBarChart(filteredPerformanceData, 'dealsClosed', 'name')}
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-purple-400"></div>
              <h4 className="font-semibold text-slate-900 mb-4">Performance Metrics</h4>
              <div className="space-y-4">
                {filteredPerformanceData.map((rep, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900">{rep.name}</span>
                      <span className="text-sm text-slate-700">{rep.winRate}</span>
                    </div>
                    {renderProgressBar(parseInt(rep.winRate), rep.color)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden relative group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sales Rep</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deals Closed</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Win Rate</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Deal Size</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Overdue Tasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPerformanceData.map((rep, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue2">{rep.name.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{rep.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{rep.dealsClosed}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">${rep.revenue.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${parseInt(rep.winRate) > 25 
                        ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200' 
                        : 'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border border-rose-200'}`}>
                        {rep.winRate}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">${rep.avgDealSize.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${rep.overdueTasks > 3 
                        ? 'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border border-rose-200' 
                        : 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200'}`}>
                        {rep.overdueTasks} tasks
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'revenue-forecast',
      name: 'Revenue Forecasting',
      description: 'Estimate expected revenue based on current pipeline',
      metrics: ['Expected revenue per stage', 'Weighted pipeline', 'Forecast vs target'],
      standard: true,
      custom: false,
      component: (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
            <h4 className="font-semibold text-slate-900 mb-4">Revenue Forecast vs Target</h4>
            {renderBarChart(forecastData.filter(item => item.actual), 'actual', 'month', '#10B981')}
            <div className="mt-6">
              <div className="text-sm font-medium text-slate-700 mb-2">Upcoming Forecast</div>
              {renderBarChart(forecastData.filter(item => !item.actual), 'forecast', 'month', '#3B82F6')}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue2/10 to-blue2/5 rounded-2xl border border-blue2/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-blue2">${forecastData[3].actual?.toLocaleString() || '365,000'}</div>
              <div className="text-sm text-slate-600">Q1 Actual Revenue</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-slate-900">${forecastData[4].forecast.toLocaleString()}</div>
              <div className="text-sm text-slate-600">Q2 Forecast</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-slate-900">${(forecastData[4].forecast + forecastData[5].forecast).toLocaleString()}</div>
              <div className="text-sm text-slate-600">H1 Forecast Total</div>
            </div>
            <div className="bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-2xl border border-emerald-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-emerald-600">96%</div>
              <div className="text-sm text-slate-600">Forecast Accuracy</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'top-opportunities',
      name: 'Top Opportunities',
      description: 'Highlight the biggest deals to focus on',
      metrics: ['Deals by potential value', 'Probability', 'Expected close date'],
      standard: true,
      custom: false,
      component: (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden relative group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Opportunity</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Probability</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Close Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rep</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {topOpportunities.map((opp, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{opp.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${
                        opp.stage === 'Negotiation' ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200' :
                        opp.stage === 'Proposal' ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200' :
                        'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {opp.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">${opp.value.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-slate-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-emerald-600 h-2 rounded-full" 
                            style={{ width: opp.probability }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-900">{opp.probability}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{opp.closeDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-blue2 font-medium">{opp.rep}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-purple-50/50 to-purple-100/30 rounded-2xl border border-purple-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-purple-600">${topOpportunities.reduce((sum, opp) => sum + opp.value, 0).toLocaleString()}</div>
              <div className="text-sm text-slate-600">Total Opportunity Value</div>
            </div>
            <div className="bg-gradient-to-r from-blue2/10 to-blue2/5 rounded-2xl border border-blue2/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-blue2">${Math.round(topOpportunities.reduce((sum, opp) => sum + (opp.value * parseInt(opp.probability) / 100), 0)).toLocaleString()}</div>
              <div className="text-sm text-slate-600">Weighted Pipeline Value</div>
            </div>
            <div className="bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-2xl border border-emerald-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-emerald-600">{Math.round(topOpportunities.reduce((sum, opp) => sum + parseInt(opp.probability), 0) / topOpportunities.length)}%</div>
              <div className="text-sm text-slate-600">Average Probability</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'lost-deals-analysis',
      name: 'Lost Deals Analysis',
      description: 'Understand why deals were lost',
      metrics: ['Lost deals by reason', 'Stage lost', 'Sales rep analysis'],
      standard: true,
      custom: false,
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
              <h4 className="font-semibold text-slate-900 mb-4">Lost Deals by Reason</h4>
              {renderBarChart(lostDealsData, 'count', 'reason', '#EF4444')}
            </div>
            <div className="space-y-4">
              {lostDealsData.map((reason, index) => (
                <div key={index} className="bg-white rounded-2xl border border-slate-200 shadow-lg p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-500 to-rose-400"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">{reason.reason}</span>
                    <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 rounded-xl border border-rose-200">{reason.count} deals</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    Lost at: {reason.avgStage} • Value: ${reason.value.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue2/10 to-blue2/5 rounded-2xl border border-blue2/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-blue2">{lostDealsData.reduce((sum, reason) => sum + reason.count, 0)}</div>
              <div className="text-sm text-slate-600">Total Lost Deals</div>
            </div>
            <div className="bg-gradient-to-r from-rose-50/50 to-rose-100/30 rounded-2xl border border-rose-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-rose-600">${lostDealsData.reduce((sum, reason) => sum + reason.value, 0).toLocaleString()}</div>
              <div className="text-sm text-slate-600">Total Lost Value</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-slate-900">Proposal</div>
              <div className="text-sm text-slate-600">Most Common Lost Stage</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const activeReportData = reports.find(r => r.id === activeReport);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="relative mb-8 md:mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-blue2/90 via-blue2/80 to-blue2/90 text-white p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/20"></div>
          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <i className="fas fa-chart-line text-3xl text-white/90"></i>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Pipeline Dashboard
            </h1>
            <p className="text-slate-200/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Real-time analytics and insights for your sales pipeline
            </p>
          </div>
        </div>

        {/* Stats Overview - Enhanced */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
            <div className="text-2xl font-bold text-blue2">$1,285,000</div>
            <div className="text-sm text-slate-600 mt-1">Quarterly Revenue</div>
            <div className="text-xs text-emerald-600 mt-3 flex items-center gap-2">
              <i className="fas fa-arrow-up"></i>
              18% from last quarter
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-emerald-400"></div>
            <div className="text-2xl font-bold text-blue2">43</div>
            <div className="text-sm text-slate-600 mt-1">Deals Closed</div>
            <div className="text-xs text-emerald-600 mt-3 flex items-center gap-2">
              <i className="fas fa-arrow-up"></i>
              22% from last quarter
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-purple-400"></div>
            <div className="text-2xl font-bold text-blue2">24%</div>
            <div className="text-sm text-slate-600 mt-1">Win Rate</div>
            <div className="text-xs text-rose-600 mt-3 flex items-center gap-2">
              <i className="fas fa-arrow-down"></i>
              3% from last quarter
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-amber-400"></div>
            <div className="text-2xl font-bold text-blue2">18.5</div>
            <div className="text-sm text-slate-600 mt-1">Avg. Days to Close</div>
            <div className="text-xs text-emerald-600 mt-3 flex items-center gap-2">
              <i className="fas fa-arrow-down"></i>
              2.5 days from last quarter
            </div>
          </div>
        </div>

        {/* Report Navigation - Enhanced */}
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto pb-1">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setActiveReport(report.id)}
                className={`px-4 py-3 text-sm font-medium rounded-t-xl transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                  activeReport === report.id 
                    ? 'bg-white border border-slate-200 border-b-0 text-blue2 shadow-lg relative' 
                    : 'text-slate-500 hover:text-blue2 hover:bg-slate-50'
                }`}
              >
                <i className={`fas fa-${report.id === 'pipeline-funnel' ? 'filter' : 
                              report.id === 'leads-source' ? 'source' : 
                              report.id === 'sales-performance' ? 'users' : 
                              report.id === 'revenue-forecast' ? 'chart-line' : 
                              report.id === 'top-opportunities' ? 'star' : 
                              'exclamation-triangle'} text-blue2`}></i>
                {report.name}
                {activeReport === report.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue2"></div>
                )}
              </button>
            ))}
            <button
              onClick={() => setActiveReport('all-reports')}
              className={`px-4 py-3 text-sm font-medium rounded-t-xl transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                activeReport === 'all-reports' 
                  ? 'bg-white border border-slate-200 border-b-0 text-blue2 shadow-lg relative' 
                  : 'text-slate-500 hover:text-blue2 hover:bg-slate-50'
              }`}
            >
              <i className="fas fa-list text-blue2"></i>
              All Reports
            </button>
          </div>
        </div>

        {/* Controls - Enhanced */}
        <div className="mb-6 bg-white rounded-2xl border border-slate-200 shadow-lg p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-blue2">
              <i className="fas fa-clock"></i>
              <span>Updated just now</span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue2 focus:border-blue2 transition-all duration-200 appearance-none bg-white"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last Quarter</option>
                <option value="1y">Last Year</option>
              </select>
              
              <select
                value={selectedRep}
                onChange={(e) => setSelectedRep(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue2 focus:border-blue2 transition-all duration-200 appearance-none bg-white"
              >
                {salesReps.map(rep => (
                  <option key={rep} value={rep}>{rep}</option>
                ))}
              </select>
              
              <button
                onClick={() => setViewMode(viewMode === 'charts' ? 'table' : 'charts')}
                className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm hover:bg-slate-50 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <i className={`fas fa-${viewMode === 'charts' ? 'table' : 'chart-bar'} text-blue2`}></i>
                {viewMode === 'charts' ? 'Table View' : 'Chart View'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {activeReport === 'all-reports' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden relative group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Report Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Purpose / Description</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Metrics / Fields</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Standard</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Custom</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-blue2/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{report.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">{report.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {report.metrics.map((metric, idx) => (
                            <span key={idx} className="block text-xs bg-blue2/10 text-blue2 px-2 py-1 rounded-lg border border-blue2/20">
                              {metric}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.standard ? (
                          <span className="px-3 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200">Yes</span>
                        ) : (
                          <span className="px-3 py-1 text-xs bg-slate-100 text-slate-800 rounded-xl">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.custom ? (
                          <span className="px-3 py-1 text-xs bg-blue2/10 text-blue2 rounded-xl border border-blue2/20">Yes</span>
                        ) : (
                          <span className="px-3 py-1 text-xs bg-slate-100 text-slate-800 rounded-xl">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setActiveReport(report.id)}
                          className="px-4 py-2 bg-blue2 text-white text-sm font-medium rounded-xl hover:bg-blue2/90 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Additional reports */}
                  <tr className="hover:bg-blue2/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">Lead Conversion Report</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">Track which leads convert into customers and how fast</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {['Leads created', 'Leads converted', 'Conversion rate', 'Average days to convert'].map((metric, idx) => (
                          <span key={idx} className="block text-xs bg-blue2/10 text-blue2 px-2 py-1 rounded-lg border border-blue2/20">
                            {metric}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200">Yes</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs bg-slate-100 text-slate-800 rounded-xl">No</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-all duration-200 shadow-md hover:shadow-lg">
                        Coming Soon
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-blue2/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">Custom Reports</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">Create your own custom reports with any metrics</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-blue2">Customizable</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs bg-slate-100 text-slate-800 rounded-xl">No</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs bg-blue2/10 text-blue2 rounded-xl border border-blue2/20">Yes</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
                        Create Custom
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            {/* Report Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                    <i className="fas fa-chart-bar text-xl text-blue2"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{activeReportData?.name}</h2>
                    <p className="text-slate-600">{activeReportData?.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Content */}
            {activeReportData?.component}

            {/* Export Options - Enhanced */}
            <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue2 to-blue2/80"></div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">Export This Report</h3>
                  <p className="text-sm text-slate-600">Download report data in multiple formats</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2.5 bg-blue2 text-white text-sm font-medium rounded-xl hover:bg-blue2/90 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2">
                    <i className="fas fa-file-excel"></i>
                    Export as Excel
                  </button>
                  <button className="px-4 py-2.5 bg-rose-600 text-white text-sm font-medium rounded-xl hover:bg-rose-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2">
                    <i className="fas fa-file-pdf"></i>
                    Export as PDF
                  </button>
                  <button className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2">
                    <i className="fas fa-file-csv"></i>
                    Export as CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Insights - Enhanced */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue2/10 to-blue2/5 rounded-2xl border border-blue2/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue2/10 border border-blue2/20 flex items-center justify-center">
                <i className="fas fa-bolt text-blue2"></i>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Quick Insights</h3>
            </div>
            <ul className="space-y-3">
              <li className="text-sm text-slate-700 flex items-start gap-2">
                <i className="fas fa-circle text-blue2 text-xs mt-1"></i>
                Website leads have highest volume (156)
              </li>
              <li className="text-sm text-slate-700 flex items-start gap-2">
                <i className="fas fa-circle text-emerald-500 text-xs mt-1"></i>
                Referral leads have best conversion (27%)
              </li>
              <li className="text-sm text-slate-700 flex items-start gap-2">
                <i className="fas fa-circle text-amber-500 text-xs mt-1"></i>
                15 deals stuck in Proposal stage
              </li>
              <li className="text-sm text-slate-700 flex items-start gap-2">
                <i className="fas fa-circle text-rose-500 text-xs mt-1"></i>
                Price is main reason for lost deals
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-2xl border border-emerald-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                <i className="fas fa-chart-line text-emerald-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Trends</h3>
            </div>
            <ul className="space-y-3">
              <li className="text-sm text-slate-700 flex items-start gap-2">
                <i className="fas fa-arrow-up text-emerald-600 text-xs mt-1"></i>
                Conversion rate increased by 2% this month
              </li>
              <li className="text-sm text-slate-700 flex items-start gap-2">
                <i className="fas fa-arrow-up text-emerald-600 text-xs mt-1"></i>
                Average deal size growing steadily
              </li>
              <li className="text-sm text-slate-700 flex items-start gap-2">
                <i className="fas fa-arrow-up text-emerald-600 text-xs mt-1"></i>
                Social media leads up 15% month-over-month
              </li>
              <li className="text-sm text-slate-700 flex items-start gap-2">
                <i className="fas fa-check-circle text-emerald-600 text-xs mt-1"></i>
                Task completion rate at 92% (above target)
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-purple-50/50 to-purple-100/30 rounded-2xl border border-purple-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center">
                <i className="fas fa-lightbulb text-purple-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Recommendations</h3>
            </div>
            <ul className="space-y-3">
              <li className="text-sm text-slate-700 flex items-start gap-2">
                <i className="fas fa-rocket text-blue2 text-xs mt-1"></i>
                Focus on speeding up proposal stage
              </li>
              <li className="text-sm text-slate-700 flex items-start gap-2">
                <i className="fas fa-gift text-emerald-600 text-xs mt-1"></i>
                Increase referral program incentives
              </li>
              <li className="text-sm text-slate-700 flex items-start gap-2">
                <i className="fas fa-chart-pie text-amber-600 text-xs mt-1"></i>
                Review pricing strategy for lost deals
              </li>
              <li className="text-sm text-slate-700 flex items-start gap-2">
                <i className="fas fa-bell text-rose-500 text-xs mt-1"></i>
                Schedule follow-ups for overdue tasks
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineDashboard;