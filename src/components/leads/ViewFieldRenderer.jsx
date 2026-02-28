// components/common/ViewFieldRenderer.jsx
import React from 'react';

const ViewFieldRenderer = ({ field, value, row }) => {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-400 italic text-sm">—</span>;
  }

  const fieldKey = field.key || field.field || '';
  const fieldType = field.type || '';

  // ============== STATUS ==============
  if (fieldKey.includes('status') || fieldType === 'status') {
    const statusMap = {
      'New': { bg: 'bg-gradient-to-br from-blue-500 to-blue-600', icon: 'fas fa-plus-circle', lightBg: 'bg-blue-50' },
      'Contacted': { bg: 'bg-gradient-to-br from-purple-500 to-purple-600', icon: 'fas fa-phone', lightBg: 'bg-purple-50' },
      'Qualified': { bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600', icon: 'fas fa-check-circle', lightBg: 'bg-emerald-50' },
      'Proposal': { bg: 'bg-gradient-to-br from-amber-500 to-amber-600', icon: 'fas fa-file-contract', lightBg: 'bg-amber-50' },
      'Negotiation': { bg: 'bg-gradient-to-br from-orange-500 to-orange-600', icon: 'fas fa-handshake', lightBg: 'bg-orange-50' },
      'Won': { bg: 'bg-gradient-to-br from-green-500 to-green-600', icon: 'fas fa-trophy', lightBg: 'bg-green-50' },
      'Lost': { bg: 'bg-gradient-to-br from-rose-500 to-rose-600', icon: 'fas fa-times-circle', lightBg: 'bg-rose-50' },
      'default': { bg: 'bg-gradient-to-br from-slate-500 to-slate-600', icon: 'fas fa-circle', lightBg: 'bg-slate-50' }
    };
    
    const config = statusMap[value] || statusMap['default'];
    
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${config.bg} animate-pulse`}></div>
        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${config.lightBg} text-${config.bg.split('-')[2]}-700 border border-${config.bg.split('-')[2]}-200`}>
          {value}
        </span>
      </div>
    );
  }

  // ============== PRIORITY ==============
  if (fieldKey.includes('priority') || fieldType === 'priority') {
    const priorityMap = {
      'High': { bg: 'from-rose-500 to-rose-600', icon: 'fas fa-arrow-up', lightBg: 'bg-rose-50', text: 'text-rose-700' },
      'Medium': { bg: 'from-amber-500 to-amber-600', icon: 'fas fa-minus', lightBg: 'bg-amber-50', text: 'text-amber-700' },
      'Low': { bg: 'from-emerald-500 to-emerald-600', icon: 'fas fa-arrow-down', lightBg: 'bg-emerald-50', text: 'text-emerald-700' },
      'default': { bg: 'from-slate-500 to-slate-600', icon: 'fas fa-circle', lightBg: 'bg-slate-50', text: 'text-slate-700' }
    };
    
    const config = priorityMap[value] || priorityMap['default'];
    
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${config.bg} text-white text-xs font-semibold shadow-md`}>
        <i className={`${config.icon} text-xs`}></i>
        {value}
      </div>
    );
  }

  // ============== PROBABILITY ==============
  if (fieldKey.includes('probability') || fieldType === 'probability') {
    const percentage = typeof value === 'string' ? parseInt(value.replace('%', '')) : Number(value);
    const color = percentage >= 70 ? 'emerald' : percentage >= 40 ? 'amber' : 'rose';
    
    return (
      <div className="w-full max-w-[200px]">
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-sm font-bold text-${color}-600`}>{percentage}%</span>
          <span className="text-xs text-slate-500">probability</span>
        </div>
        <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div 
            className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-${color}-500 to-${color}-400 transition-all duration-700 ease-out`}
            style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // ============== CURRENCY ==============
  if (fieldType === 'currency' || fieldKey.includes('amount') || fieldKey.includes('price') || fieldKey.includes('value')) {
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value));
    
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200 flex items-center justify-center">
          <i className="fas fa-indian-rupee-sign text-emerald-600 text-sm"></i>
        </div>
        <span className="text-lg font-bold text-emerald-700 tracking-tight">{formatted}</span>
      </div>
    );
  }

  // ============== DATE ==============
  if (fieldType === 'date' || fieldKey.includes('date') || fieldKey.includes('_at')) {
    const date = new Date(value);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isFuture = date > today;
    const isPast = date < today;
    
    let badgeColor = 'slate';
    let badgeText = '';
    
    if (isToday) badgeColor = 'blue';
    else if (isFuture) badgeColor = 'emerald';
    else if (isPast) badgeColor = 'amber';
    
    return (
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${badgeColor}-100 to-${badgeColor}-50 border border-${badgeColor}-200 flex items-center justify-center`}>
          <i className={`fas fa-calendar-alt text-${badgeColor}-600 text-sm`}></i>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900">
            {date.toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            {isToday && <span className="text-blue-600 font-medium">Today</span>}
            {isFuture && <span className="text-emerald-600 font-medium">Upcoming</span>}
            {isPast && !isToday && <span className="text-amber-600 font-medium">Past</span>}
          </span>
        </div>
      </div>
    );
  }

  // ============== EMAIL ==============
  if (fieldType === 'email' || fieldKey.includes('email')) {
    return (
      <div className="group relative">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50/50 transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center">
            <i className="fas fa-envelope text-blue-600 text-sm"></i>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900">{value}</span>
            <a href={`mailto:${value}`} className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <i className="fas fa-paper-plane text-[10px]"></i>
              send email
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ============== PHONE ==============
  if (fieldType === 'phone' || fieldKey.includes('phone') || fieldKey.includes('mobile')) {
    return (
      <div className="group relative">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-purple-50/50 transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200 flex items-center justify-center">
            <i className="fas fa-phone-alt text-purple-600 text-sm"></i>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900">{value}</span>
            <a href={`tel:${value}`} className="text-xs text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <i className="fas fa-phone text-[10px]"></i>
              call now
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ============== USER / OWNER ==============
  if (fieldType === 'user' || fieldKey.includes('owner') || fieldKey.includes('assigned') || fieldKey.includes('user')) {
    const initials = value.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['from-blue-500 to-blue-600', 'from-emerald-500 to-emerald-600', 'from-purple-500 to-purple-600', 'from-amber-500 to-amber-600', 'from-rose-500 to-rose-600'];
    const gradient = colors[value.length % colors.length];
    
    return (
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
          {initials || '?'}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900">{value}</span>
          <span className="text-xs text-slate-500">{field.label || 'Owner'}</span>
        </div>
      </div>
    );
  }

  // ============== INDUSTRY ==============
  if (fieldKey.includes('industry')) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue2/20 to-blue2/10 border border-blue2/30 flex items-center justify-center">
          <i className="fas fa-industry text-blue2 text-sm"></i>
        </div>
        <span className="px-3 py-1.5 bg-blue2/5 text-blue2 rounded-lg text-sm font-medium border border-blue2/20">
          {value}
        </span>
      </div>
    );
  }

  // ============== COMPANY ==============
  if (fieldKey.includes('company')) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-200 flex items-center justify-center">
          <i className="fas fa-building text-indigo-600 text-sm"></i>
        </div>
        <span className="text-sm font-semibold text-slate-900">{value}</span>
      </div>
    );
  }

  // ============== ADDRESS ==============
  if (fieldKey.includes('address')) {
    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200 flex items-center justify-center mt-0.5">
          <i className="fas fa-map-marker-alt text-amber-600 text-sm"></i>
        </div>
        <span className="text-sm text-slate-700 leading-relaxed">{value}</span>
      </div>
    );
  }

  // ============== WEBSITE ==============
  if (fieldKey.includes('website') || fieldKey.includes('url')) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-100 to-cyan-50 border border-cyan-200 flex items-center justify-center">
          <i className="fas fa-globe text-cyan-600 text-sm"></i>
        </div>
        <a href={value.startsWith('http') ? value : `https://${value}`} 
           target="_blank" 
           rel="noopener noreferrer"
           className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline truncate max-w-[200px]">
          {value}
        </a>
      </div>
    );
  }

  // ============== NUMBER ==============
  if (fieldType === 'number') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center">
          <i className="fas fa-hashtag text-slate-600 text-sm"></i>
        </div>
        <span className="text-lg font-semibold text-slate-900">
          {new Intl.NumberFormat("en-IN").format(Number(value))}
        </span>
      </div>
    );
  }

  // ============== TAGS / ARRAYS ==============
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((item, i) => (
          <span key={i} className="px-2.5 py-1 bg-gradient-to-r from-blue2/10 to-blue2/5 text-blue2 text-xs font-medium rounded-lg border border-blue2/20">
            {item}
          </span>
        ))}
      </div>
    );
  }

  // ============== PERCENTAGE ==============
  if (fieldKey.includes('percent') || fieldKey.includes('rate') || value.toString().includes('%')) {
    const num = parseFloat(value.toString().replace('%', ''));
    if (!isNaN(num)) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-blue2">{num}%</span>
          <span className="text-xs text-slate-500">rate</span>
        </div>
      );
    }
  }

  // ============== DEFAULT ==============
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
        <i className="fas fa-tag text-slate-500 text-xs"></i>
      </div>
      <span className="text-sm text-slate-800">{value}</span>
    </div>
  );
};

export default ViewFieldRenderer;