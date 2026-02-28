// components/common/LeadTableFieldRenderer.jsx
import React from 'react';

const LeadTableFieldRenderer = ({ field, value, row }) => {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted italic">-</span>;
  }

  // Helper function to extract percentage from various formats
  const getPercentageValue = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      // Remove % sign and convert to number
      const num = parseFloat(val.replace('%', '').trim());
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  // Function to get initials from name
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '?';
    const names = name.trim().split(' ');
    if (names.length === 0) return '?';
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Function to generate color from text (for consistent avatar colors)
  const getAvatarColor = (text) => {
    if (!text) return 'bg-blue-2 text-blue-700 border-blue-200';
    
    const colors = [
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-rose-100 text-rose-700 border-rose-200',
      'bg-cyan-100 text-cyan-700 border-cyan-200'
    ];
    
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Check field key first (more reliable than field.type)
  const fieldKey = field.field || field.key || '';
  const fieldType = field.type || '';

  // Handle NAME field (check for exact match "name" first, then includes)
  if (fieldKey === 'name' || fieldKey.toLowerCase().includes('name')) {
    const initials = getInitials(value);
    const avatarColor = getAvatarColor(value);
    return (
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${avatarColor} border flex items-center justify-center`}>
          <span className="font-semibold text-sm">
            {initials}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-text">{value}</span>
          {row?.industry && (
            <span className="text-xs text-muted mt-0.5">{row.industry}</span>
          )}
        </div>
      </div>
    );
  }

  // Handle INDUSTRY field
  if (fieldKey === 'industry' || fieldKey.toLowerCase().includes('industry')) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue2/10 border border-blue2/20 flex items-center justify-center">
          <i className="fas fa-industry text-blue2 text-sm"></i>
        </div>
        <span className="text-sm font-medium text-text bg-blue2/5 px-3 py-1.5 rounded-lg border border-blue2/10">
          {value}
        </span>
      </div>
    );
  }

  // Handle PROBABILITY field
  if (fieldKey === 'probability' || fieldKey.toLowerCase().includes('probability') || fieldType === 'probability') {
    const percentage = getPercentageValue(value);
    const barColor = percentage >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                    percentage >= 40 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                    'bg-gradient-to-r from-rose-500 to-rose-400';
    
    const textColor = percentage >= 70 ? 'text-emerald-700' :
                     percentage >= 40 ? 'text-amber-700' :
                     'text-rose-700';
    
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm font-semibold ${textColor}`}>{percentage}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${barColor} transition-all duration-300`}
            style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
          ></div>
        </div>
      </div>
    );
  }

  // Handle STATUS field
  if (fieldKey === 'status' || fieldKey.toLowerCase().includes('status') || fieldType === 'status') {
    const statusConfig = {
      'New': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'fas fa-plus-circle' },
      'Contacted': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: 'fas fa-phone' },
      'Qualified': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'fas fa-check-circle' },
      'Proposal': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'fas fa-file-contract' },
      'Negotiation': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: 'fas fa-handshake' },
      'Won': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'fas fa-trophy' },
      'Lost': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: 'fas fa-times-circle' },
      'default': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', icon: 'fas fa-circle' }
    };
    
    const config = statusConfig[value] || statusConfig['default'];
    return (
      <div className={`px-3 py-1.5 rounded-xl border ${config.bg} ${config.border} flex items-center gap-2`}>
        <i className={`${config.icon} ${config.text} text-xs`}></i>
        <span className={`text-xs font-semibold ${config.text}`}>{value}</span>
      </div>
    );
  }

  // Continue with other field types based on field.type
  switch (fieldType) {
    case "currency":
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
            <i className="fas fa-rupee-sign text-emerald-600 text-xs"></i>
          </div>
          <span className="text-emerald-700 font-semibold">
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(Number(value))}
          </span>
        </div>
      );

    case "date":
      const date = new Date(value);
      const isToday = new Date().toDateString() === date.toDateString();
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg ${isToday ? 'bg-blue2/20 border border-blue2/30' : 'bg-blue2/10 border border-blue2/20'} flex items-center justify-center`}>
              <i className={`fas fa-calendar-alt ${isToday ? 'text-blue2' : 'text-blue2/80'} text-xs`}></i>
            </div>
            <span className={`text-sm ${isToday ? 'text-blue2 font-medium' : 'text-text'}`}>
              {date.toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
            </span>
          </div>
          <span className="text-xs text-muted ml-8">
            {date.toLocaleDateString("en-IN", { year: 'numeric' })}
          </span>
        </div>
      );

    case "number":
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue2/10 border border-blue2/20 flex items-center justify-center">
            <i className="fas fa-hashtag text-blue2 text-xs"></i>
          </div>
          <span className="font-semibold text-text">
            {new Intl.NumberFormat("en-IN").format(Number(value))}
          </span>
        </div>
      );

    case "user":
      const userInitials = getInitials(value);
      const userAvatarColor = getAvatarColor(value);
      return (
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-9 h-9 rounded-xl ${userAvatarColor} border flex items-center justify-center`}>
              <span className="font-semibold text-sm">
                {userInitials}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text">{value}</span>
            <span className="text-xs text-muted">Assigned</span>
          </div>
        </div>
      );

    case "phone":
      return (
        <div className="group">
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue2/5 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue2/10 border border-blue2/20 flex items-center justify-center group-hover:bg-blue2/20 transition-colors">
              <i className="fas fa-phone text-blue2 text-xs"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text">{value}</span>
              <button className="text-xs text-blue2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <i className="fas fa-phone-alt text-[10px]"></i>
                Call now
              </button>
            </div>
          </div>
        </div>
      );

    case "email":
      return (
        <div className="group">
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue2/5 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue2/10 border border-blue2/20 flex items-center justify-center group-hover:bg-blue2/20 transition-colors">
              <i className="fas fa-envelope text-blue2 text-xs"></i>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium text-text truncate">{value}</span>
              <a 
                href={`mailto:${value}`}
                className="text-xs text-blue2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 truncate"
              >
                <i className="fas fa-paper-plane text-[10px]"></i>
                Send email
              </a>
            </div>
          </div>
        </div>
      );

    case "priority":
      const priorityConfig = {
        'High': { bg: 'from-rose-50 to-rose-100', text: 'text-rose-700', border: 'border-rose-200', icon: 'fas fa-arrow-up' },
        'Medium': { bg: 'from-amber-50 to-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: 'fas fa-minus' },
        'Low': { bg: 'from-emerald-50 to-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'fas fa-arrow-down' },
        'default': { bg: 'from-slate-100 to-slate-200', text: 'text-slate-700', border: 'border-slate-300', icon: 'fas fa-circle' }
      };
      
      const priority = priorityConfig[value] || priorityConfig['default'];
      return (
        <div className={`px-3 py-1.5 rounded-xl border bg-gradient-to-r ${priority.bg} ${priority.border} flex items-center gap-2`}>
          <i className={`${priority.icon} ${priority.text} text-xs`}></i>
          <span className={`text-xs font-semibold ${priority.text}`}>{value}</span>
        </div>
      );

    default:
      // Check if field key contains specific keywords
      if (fieldKey.toLowerCase().includes('description') || fieldKey.toLowerCase().includes('notes')) {
        return (
          <div className="max-w-xs">
            <span className="text-text text-sm line-clamp-2">{value}</span>
          </div>
        );
      }
      
      if (fieldKey.toLowerCase().includes('address')) {
        return (
          <div className="flex items-start gap-2">
            <i className="fas fa-map-marker-alt text-blue2 text-sm mt-0.5"></i>
            <span className="text-text text-sm">{value}</span>
          </div>
        );
      }
      
      // Generic text field
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
            <i className="fas fa-tag text-slate-500 text-xs"></i>
          </div>
          <span className="text-text">{value}</span>
        </div>
      );
  }
};

export default LeadTableFieldRenderer;