import React from 'react';

const PageHeader = ({ 
  title, 
  description, 
  icon = 'fas fa-chart-pie',
  buttonText = 'Add New',
  onButtonClick,
  stats = null,
  collapsed = false
}) => {
  // Calculate left margin based on sidebar width
  const leftMargin = collapsed ? 'ml-[60px]' : 'ml-[140px]';

  return (
   <div className={`${leftMargin} mr-14 mt-4 transition-all duration-300`}>
      <div className="bg-blue2 text-white rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left Side - Title & Description */}
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <i className={`${icon} text-2xl`}></i>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {title}
              </h1>
              <p className="text-white/90">
                {description}
              </p>
              
              {/* Stats Row */}
              {stats && (
                <div className="flex flex-wrap gap-4 mt-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
                      <span className="text-sm">
                        <span className="font-semibold">{stat.value}</span> {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Side - Button */}
          {onButtonClick && (
            <button
              onClick={onButtonClick}
              className="px-6 py-3 text-sm font-semibold text-blue2 bg-white rounded-xl hover:bg-gray-100 hover:shadow-xl transition-all duration-200 flex items-center gap-3 self-start md:self-center"
            >
              <i className="fas fa-plus"></i>
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;