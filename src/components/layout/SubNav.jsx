// components/layout/SubNav.jsx

import React, { useState, useEffect } from "react";

const SubNav = ({
  collapsed = false,
  sections = {},
  setActiveModule
}) => {

  const sectionKeys = Object.keys(sections);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    if (sectionKeys.length > 0) {
      setActiveSection(sectionKeys[0]);
    }
  }, [sections]);

  if (!activeSection) return null;

  const leftMargin = collapsed ? "ml-[60px]" : "ml-[140px]";

  return (
    <div className={`${leftMargin} mr-14 transition-all duration-300`}>

      <nav className="bg-blue2 rounded-xl border border-blue2/20 w-full overflow-hidden">

        {/* SECTION TABS */}
        <div className="flex items-center justify-between w-full px-4 py-2 border-b border-white/20 gap-2">
          {sectionKeys.map((key) => {
            const section = sections[key];

            return (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`flex-1 px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border ${
                  activeSection === key
                    ? "border-white bg-white text-blue2"
                    : "border-transparent text-white/90 hover:border-white/40 hover:bg-white/10"
                }`}
              >
                <i className={`${section.icon || ""} text-base`} />
                <span className="text-sm font-medium">
                  {section.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ITEMS */}
        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {sections[activeSection]?.items?.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveModule(item.key)}
                className="flex-1 flex items-center justify-center gap-3 px-4 py-2.5 hover:border border-white hover:bg-white/10 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30">
                  <i className={`${item.icon} text-sm text-white`} />
                </div>

                <span className="text-sm font-medium text-white">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

      </nav>
    </div>
  );
};

export default SubNav;