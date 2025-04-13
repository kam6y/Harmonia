import React, { useState } from 'react';
import CategoryScoreSection from '@/components/common/CategoryScoreSection';

const ScoreToggleComponent = ({ pulseSurveyData, managerScoreData }) => {
  // 表示モード（パルスサーベイまたは管理者スコア）
  const [displayMode, setDisplayMode] = useState('pulsesurvey');
  // 比較期間の状態
  const [comparisonPeriod, setComparisonPeriod] = useState('前回');

  return (
    <div className="px-6 pb-6 mt-6">
      <div className="bg-white rounded-lg shadow-md p-4">
        {/* タイトルとトグルボタン */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-brand-darkBlue">
            {displayMode === 'pulsesurvey' ? 'パルスサーベイの項目毎のスコア一覧' : '管理者の項目毎のスコア一覧'}
          </h2>
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1 text-sm rounded-md ${displayMode === 'pulsesurvey' ? 'bg-brand-teal text-white' : 'bg-brand-lightGray text-gray-700'}`}
              onClick={() => setDisplayMode('pulsesurvey')}
            >
              パルスサーベイ
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md ${displayMode === 'manager' ? 'bg-brand-teal text-white' : 'bg-brand-lightGray text-gray-700'}`}
              onClick={() => setDisplayMode('manager')}
            >
              管理者スコア
            </button>
          </div>
        </div>

        {/* 選択されたデータセクションを表示 */}
        <CategoryScoreSection
          mergedData={displayMode === 'pulsesurvey' ? pulseSurveyData : managerScoreData}
          comparisonPeriod={comparisonPeriod}
          setComparisonPeriod={setComparisonPeriod}
        />
      </div>
    </div>
  );
};

export default ScoreToggleComponent;