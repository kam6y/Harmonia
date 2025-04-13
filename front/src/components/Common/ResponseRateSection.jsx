import React from 'react';

const ResponseRateSection = ({
  currentRate = 0,
  rateComparison = '0.0%',
  isPositive = true,
  rateHistory = [],
  isCompact = false,
}) => {
  const history = rateHistory || [];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className={`flex flex-col ${isCompact ? 'lg:flex-row' : 'lg:flex-row'} gap-8`}>
        {/* 左側カラム: 解答率とトレンド */}
        <div className={`${isCompact ? 'lg:w-1/4' : 'lg:w-1/5'} pb-4 lg:pb-0 lg:border-r lg:border-gray-100 lg:pr-8`}>
          <h3 className="font-medium text-gray-700 mb-6 flex items-center text-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 text-brand-coral">
              <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>解答率</span>
          </h3>
          
          <div className="flex flex-col">
            <div className="text-6xl font-bold bg-gradient-to-r from-brand-coral to-brand-coral bg-clip-text text-transparent">
              {currentRate}
              <span className="text-4xl">%</span>
            </div>
            
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">前回比: </span>
              <span 
                className={`ml-2 font-medium flex items-center ${
                  isPositive ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {rateComparison}
                {isPositive ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                    <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 6H23V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                    <path d="M23 18L13.5 8.5L8.5 13.5L1 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 18H23V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* 右側カラム: 解答率推移 */}
        <div className={`${isCompact ? 'lg:w-3/4' : 'lg:w-4/5'}`}>
          <h3 className="font-medium text-gray-700 mb-6 flex items-center text-lg">
            <div className="w-1 h-5 bg-brand-coral rounded-full mr-2"></div>
            解答率推移
          </h3>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* アバター&メッセージ部分 */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-coral to-brand-coral flex items-center justify-center flex-shrink-0 shadow-md">
                <img src="/images/RateDog.png" alt="アバター" className="w-full h-full object-cover rounded-full" />
              </div>
              
              <div className="relative bg-gray-50 p-4 rounded-lg rounded-tl-none shadow-sm border border-gray-100">
                <div className="absolute -left-2 top-3 w-0 h-0 border-t-8 border-r-8 border-b-0 border-l-0 border-gray-50"></div>
                <p className="text-sm text-gray-600">解答率が前回と比べて</p>
                <p className={`font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isPositive ? '上昇しています！' : '下降しています'}
                </p>
                <p className="text-sm text-gray-600 mt-1">{isPositive ? 'この調子！' : '次回に期待！'}</p>
              </div>
            </div>

            {/* 履歴テーブル */}
            <div className="lg:w-2/3 overflow-hidden">
              <div className="overflow-x-auto pb-2">
                <div className="min-w-max">
                  <div className="grid grid-flow-col gap-2 auto-cols-max">
                    {history.map((item, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="text-xs text-gray-500 mb-2 whitespace-nowrap">{item.date}</div>
                        <div className={`
                          h-16 w-16 rounded-lg flex items-center justify-center
                          ${item.rate > (history[index-1]?.rate || 0) ? 'bg-orange-50-50 border-orange-200-200' : 'bg-gray-50 border-gray-200'}
                          border
                        `}>
                          <div className={`text-xl font-bold ${
                            item.rate > (history[index-1]?.rate || 0) ? 'text-brand-coral' : 'text-gray-700'
                          }`}>
                            {item.rate !== null ? `${item.rate}%` : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseRateSection;