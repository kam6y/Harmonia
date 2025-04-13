// components/common/CategoryScoreSection.jsx
import React from 'react';
import CategoryScoreTable from './CategoryScoreTable';

const CategoryScoreSection = ({ 
  mergedData, 
  comparisonPeriod, 
  setComparisonPeriod,
  title  // タイトルを親から受け取るようにパラメータを追加
}) => {
  return (
    <div className='m-4'>
      {/* title プロパティがある場合のみ表示 */}
      {title && <h3 className="text-xl font-bold text-gray-900 ml-8 my-6">{title}</h3>}
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-md">
          <CategoryScoreTable 
            mergedData={mergedData} 
            comparisonPeriod={comparisonPeriod} 
            setComparisonPeriod={setComparisonPeriod} 
          />
          
          <div className="flex justify-between p-4">
            <div className="flex space-x-4">
              <button className="bg-brand-teal hover:bg-brand-darkBlue text-white px-4 py-2 rounded transition duration-300">
                スコア一覧をダウンロード
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryScoreSection;