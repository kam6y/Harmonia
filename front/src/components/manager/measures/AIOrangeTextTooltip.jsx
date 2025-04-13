// front/src/components/manager/measures/AIOrangeTextTooltip.jsx
import React from 'react';

const AIOrangeTextTooltip = ({ onClose }) => (
  <div className="absolute top-0 right-10 bg-white shadow-md border border-gray-200 rounded-lg p-3 text-sm max-w-xs animate-fadeIn z-30">
    <button 
      onClick={onClose}
      className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
      aria-label="閉じる"
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M18 6L6 18M6 6L18 18" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </button>
    <div className="text-brand-darkBlue">
      <span className="font-semibold text-brand-teal block mb-1">AI生成テキスト</span>
      <p>AI生成されたテキストは<span className="text-brand-orange font-semibold">オレンジ色</span>で表示されています。編集すると通常の黒色テキストになります。</p>
    </div>
    <div className="absolute bottom-[-8px] right-10 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
  </div>
);

export default AIOrangeTextTooltip;