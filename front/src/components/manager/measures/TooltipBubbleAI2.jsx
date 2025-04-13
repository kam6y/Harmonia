// front/src/components/manager/measures/TooltipBubble.jsx
import React from 'react';

const TooltipBubble = ({ text, onClose }) => (
  <div className="absolute -top-20 w-[20rem] right-0 bg-white shadow-md border border-gray-200 rounded-lg p-2 text-sm z-30">
    <div className="flex justify-between items-start mb-1">
      <div className="text-brand-darkBlue text-wrap font-medium">{text}</div>
      <button 
        onClick={onClose} 
        className="text-gray-400 hover:text-gray-600 ml-2 -mt-1 focus:outline-none"
        aria-label="閉じる"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
    <div className="absolute bottom-[-8px] right-4 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
  </div>
);

export default TooltipBubble;