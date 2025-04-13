// front/src/components/common/ScoreTable.jsx
import React from 'react';

const ScoreTable = ({ title, data, showComparisonButton = true }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {showComparisonButton && (
          <button className="border border-gray-300 rounded px-4 py-2 text-gray-600 hover:bg-gray-100">
            前回と比較
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-brand-teal text-white">
              <th className="py-3 px-4 text-left">領域</th>
              <th className="py-3 px-4 text-left">カテゴリー</th>
              <th className="py-3 px-4 text-center">
                期待<span className="text-yellow-300">★</span>
              </th>
              <th className="py-3 px-4 text-center">前回比</th>
              <th className="py-3 px-4 text-center">
                満足<span className="text-brand-coral">●</span>
              </th>
              <th className="py-3 px-4 text-center">前回比</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr 
                key={index} 
                className={index % 2 === 0 ? 'bg-white' : 'bg-brand-lightGray'}
              >
                <td className="py-4 px-4 text-gray-600">{row.area}</td>
                <td className="py-4 px-4 text-gray-600">{row.category}</td>
                <td className="py-4 px-4 text-center">{row.expectationScore}</td>
                <td className="py-4 px-4 text-center">
                  <span className={`flex items-center justify-center ${row.expectationDiff > 0 ? 'text-brand-coral' : ''}`}>
                    {row.expectationDiff > 0 ? '+' : ''}{row.expectationDiff} 
                    {row.expectationDiff > 0 && (
                      <svg className="w-4 h-4 ml-1 text-brand-coral" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">{row.satisfactionScore}</td>
                <td className="py-4 px-4 text-center">
                  <span className={`flex items-center justify-center ${row.satisfactionDiff > 0 ? 'text-brand-coral' : ''}`}>
                    {row.satisfactionDiff > 0 ? '+' : ''}{row.satisfactionDiff}
                    {row.satisfactionDiff > 0 && (
                      <svg className="w-4 h-4 ml-1 text-brand-coral" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreTable;