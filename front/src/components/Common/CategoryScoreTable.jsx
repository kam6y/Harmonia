// components/common/CategoryScoreTable.jsx
import React from 'react';

const CategoryScoreTable = ({ 
  mergedData = [], 
  comparisonPeriod = '前回', 
  setComparisonPeriod = () => {} 
}) => {
  // 安全なデータアクセス
  const safeData = Array.isArray(mergedData) ? mergedData : [];
  
  // 差分値の表示とスタイリング
  const renderDiff = (item, field) => {
    if (!item) return null;
    
    // 比較期間に応じて差分値を選択
    const value = comparisonPeriod === '前回' 
      ? (field === 'expectation' ? item.expectationDiff : item.satisfactionDiff)
      : (field === 'expectation' ? item.expectationYoyDiff : item.satisfactionYoyDiff);
    
    // 値がundefinedやnullの場合は処理しない
    if (value === undefined || value === null) {
      return (
        <span className="text-gray-500 flex items-center">
          - <span className="ml-1">-</span>
        </span>
      );
    }
    
    const absValue = Math.abs(value).toFixed(1);
    if (value > 0) {
      return (
        <span className="text-red-500 flex items-center">
          +{absValue} <span className="ml-1">↑</span>
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="text-blue-500 flex items-center">
          -{absValue} <span className="ml-1">↓</span>
        </span>
      );
    } else {
      return (
        <span className="text-gray-500 flex items-center">
          0.0 <span className="ml-1">-</span>
        </span>
      );
    }
  };

  // 数値を安全に表示するヘルパー関数
  const safeToFixed = (value) => {
    if (value === undefined || value === null) return '-';
    if (typeof value !== 'number') return '-';
    try {
      return value.toFixed(1);
    } catch (e) {
      return '-';
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-600">
            全{safeData.length}件表示
          </span>
        </div>
        <div className="bg-white rounded-lg">
          <select
            value={comparisonPeriod}
            onChange={(e) => setComparisonPeriod(e.target.value)}
            className="border text-black border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-teal"
          >
            <option value="前回">前回と比較</option>
            <option value="前年同月">前年同月と比較</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-brand-teal text-white">
              <th className="px-6 py-3 text-left w-2/12">
                <span className="text-white">カテゴリー</span>
              </th>
              <th className="px-6 py-3 text-left w-4/12">
                <span className="text-white">質問事項</span>
              </th>
              <th className="px-6 py-3 text-center w-1/12">
                <span className="text-white">期待</span>
              </th>
              <th className="px-2 py-3 text-center w-1/12">
                <span className="text-white">前回比(期待)</span>
              </th>
              <th className="px-6 py-3 text-center w-1/12">
                <span className="text-white">満足</span>
              </th>
              <th className="px-2 py-3 text-center w-1/12">
                <span className="text-white">前回比(満足)</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {safeData.map((item, index) => (
              <tr 
                key={item.categoryId || index} 
                className="border-b hover:bg-gray-50"
              >
                <td className="px-6 py-3 text-sm text-gray-700">{item.category || '-'}</td>
                <td className="px-6 py-3 text-sm text-wrap text-gray-700">{item.question || '-'}</td>
                <td className="px-6 py-3 text-center font-bold text-gray-800">{safeToFixed(item.expectation)}</td>
                <td className="px-6 py-3 text-center">{renderDiff(item, 'expectation')}</td>
                <td className="px-6 py-3 text-center font-bold text-gray-800">{safeToFixed(item.satisfaction)}</td>
                <td className="px-6 py-3 text-center">{renderDiff(item, 'satisfaction')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryScoreTable;