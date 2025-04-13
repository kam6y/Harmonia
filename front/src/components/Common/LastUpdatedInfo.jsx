import React from 'react';

const LastUpdatedInfo = ({ history }) => {
  // historyが存在し、要素が含まれている場合のみ処理を行う
  if (!history || history.length === 0) {
    return null;
  }

  // 最新の調査データを取得
  const latestSurvey = history[history.length - 1];
  
  // 日付をフォーマット（例：2025-02-07 → 2025年2月7日）
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  };

  return (
    <div className="flex items-center justify-end mt-2 mr-6 text-sm text-gray-600">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 mr-1" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <span>最終更新: {formatDate(latestSurvey.date)}</span>
    </div>
  );
};

export default LastUpdatedInfo;