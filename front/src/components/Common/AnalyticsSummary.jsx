import React from 'react'

const AnalyticsSummary = ({ summaryData = {} }) => {
  // デフォルト値を設定するか、存在確認を行う
  const {
    priorityCategories = [],
    insights = [],
    onTrackMeasures = [],
    poorPerformingMeasures = [],
    summary = '' // 効果分析サマリーテキスト
  } = summaryData || {};

  return (
    <div className="mt-4 px-4 mx-2 pb-2">
      <h2 className="text-xl font-bold text-brand-darkBlue mb-2">課題・施策分析サマリー</h2>
      
      <div className="bg-white rounded-lg shadow p-3">
        {/* 優先カテゴリとインサイトを上部に配置 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* 優先度の高いカテゴリ */}
          <div className="bg-brand-lightGray rounded-lg p-2">
            <h3 className="text-base font-semibold text-brand-darkBlue mb-1">改善優先度の高いカテゴリ</h3>
            <div className="space-y-1">
              {onTrackMeasures.map((measure, index) => (
                  <div key={index} className="flex items-center bg-white rounded p-1 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: measure.color }}></div>
                    <span className="text-gray-700 font-medium truncate">{measure.title}</span>
                    {/*<span className="ml-auto text-xs text-green-600 px-1.5 py-0.5 bg-green-50 rounded-full whitespace-nowrap">*/}
                    {/*  {measure.status} +{measure.categoryGapPercentage}%*/}
                    {/*</span>*/}
                  </div>
              ))}
            </div>
          </div>

          {/* インサイト */}
          <div className="bg-brand-lightGray rounded-lg p-2">
            <h3 className="text-base font-semibold text-brand-darkBlue mb-1">分析インサイト</h3>
            <ul className="list-disc pl-4 space-y-0.5 text-sm text-gray-700">
              {insights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2カラムレイアウト（施策） */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 期待通りに進行中の施策セクション */}
          <div>
            <h3 className="text-base font-semibold text-brand-darkBlue mb-1">期待通りに進行中の施策</h3>
            <div className="bg-brand-lightGray rounded-lg p-2">
              <div className="space-y-1">
                {priorityCategories.map((category, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
                      <span className="text-sm text-gray-700">{category.title}</span>
                    </div>
                ))}
              </div>
            </div>
          </div>

          {/* 効果が出ていない施策セクション */}
          <div>
            <h3 className="text-base font-semibold text-brand-darkBlue mb-1">効果が出ていない施策</h3>
            <div className="bg-brand-lightGray rounded-lg p-2">
              <div className="space-y-1">
                {poorPerformingMeasures.map((measure, index) => (
                  <div key={index} className="flex items-center bg-white rounded p-1 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: measure.color }}></div>
                    <span className="text-gray-700 font-medium truncate">{measure.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsSummary