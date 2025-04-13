// front/src/components/manager/measures/TooltipBubble.jsx
import React from 'react';

const TooltipBubble = ({ text }) => (
  <div className="absolute -top-10 right-0 bg-white shadow-md border border-gray-200 rounded-lg p-2 text-sm whitespace-nowrap animate-bounce z-30">
    <div className="text-brand-darkBlue font-medium">{text}</div>
    <div className="absolute bottom-[-8px] right-4 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
  </div>
);

export default TooltipBubble;
