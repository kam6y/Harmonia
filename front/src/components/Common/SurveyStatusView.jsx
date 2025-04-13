// front/src/components/common/SurveyStatusView.jsx
import React, { useState, useEffect } from 'react'
import SurveyInProgressView from './SurveyInProgressView'
import SurveyCompletedView from './SurveyCompletedView'

/**
 * サーベイ状態バナーコンポーネント
 */
const SurveyStatusBanner = ({ surveyState, surveyData }) => {
  if (!surveyData) return null;

  // 回答期間の残り日数を計算
  const getRemainingDays = () => {
    const now = new Date();
    const endDate = new Date(surveyData.endDate || new Date());
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // 開始日・終了日をフォーマット
  const formatDate = (dateString) => {
    if (!dateString) return '日付なし';
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (surveyState === 'inProgress') {
    return (
      <div className="bg-brand-orange text-white p-3 rounded-md mb-4 mx-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="font-bold">サーベイ回答期間中</span>
            <span className="ml-2 text-sm">
              回答期間: {formatDate(surveyData.startDate)} - {formatDate(surveyData.endDate)}
            </span>
          </div>
          <div className="text-sm bg-white text-brand-darkBlue px-2 py-1 rounded">
            回答期間残り{getRemainingDays()}日
          </div>
        </div>
        <div className="text-sm bg-white text-brand-darkBlue p-2 rounded mt-2">
          <p>回答率を主にチェックし、不足している場合リマインドをしましょう！</p>
        </div>
      </div>
    );
  } else if (surveyState === 'completed') {
    return (
      <div className="bg-brand-teal text-white p-3 rounded-md mb-4 mx-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="font-bold">サーベイ回答期間終了</span>
            <span className="ml-2 text-sm">
              回答期間終了: {formatDate(surveyData.endDate)}
            </span>
          </div>
          <div className="text-sm bg-white text-brand-darkBlue px-2 py-1 rounded">
            全ての結果が反映されています
          </div>
        </div>
        <div className="text-sm bg-white text-brand-darkBlue p-2 rounded mt-2">
          <p>あなたの組織同士のデータ結果を比較しながら分析し、組織ごとに課題を立案しましょう！</p>
        </div>
      </div>
    );
  }

  return null;
};

/**
 * サーベイ状態に応じたビューを管理し、切り替えを提供するコンポーネント
 * 
 * @param {Object} props
 * @param {string} props.initialState - 初期状態 ('inProgress' or 'completed')
 * @param {Object} props.surveyData - サーベイデータ
 * @param {Object} props.viewProps - ビューコンポーネントに渡すプロパティ
 * @param {Object} props.scoreData - スコア表示に使用するデータ
 * @param {boolean} props.showToggle - 状態切替ボタンを表示するかどうか
 * @param {Function} props.onStateChange - 状態変更時のコールバック関数
 * @param {number} props.tenant_id - テナントID
 * @param {number} props.department_id - 部署ID
 */
const SurveyStatusView = ({
  initialState = 'loading',
  surveyData = {},
  viewProps = {},
  scoreData = { history: [], score: 0, ratingLabel: '-' },
  showToggle = false,
  onStateChange = () => {},
  tenant_id = null,
  department_id = null
}) => {
  // サーベイ状態管理（永続化された値があればそれを使用）
  const [surveyState, setSurveyState] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedState = localStorage.getItem('surveyDisplayState');
      if (savedState && (savedState === 'inProgress' || savedState === 'completed')) {
        return savedState;
      }
    }
    return initialState !== 'loading' ? initialState : 'inProgress';
  });
  
  // 明示的な状態オーバーライド（トグルボタンでの切替時など）
  const [overrideState, setOverrideState] = useState(null);

  // 初期状態の決定（ローディング時のみ自動判定）
  useEffect(() => {
    if (surveyState !== 'loading' || overrideState) {
      return;
    }
    
    // 自動判定ロジック
    const determineSurveyState = (surveyData) => {
      if (!surveyData || !surveyData.endDate) return 'inProgress';
      const now = new Date();
      const endDate = new Date(surveyData.endDate);
      return now > endDate ? 'completed' : 'inProgress';
    };

    const newState = determineSurveyState(surveyData);
    setSurveyState(newState);
    onStateChange(newState);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('surveyDisplayState', newState);
    }
  }, [surveyData, surveyState, overrideState, onStateChange]);

  // モード切替関数
  const toggleDisplayMode = () => {
    const currentDisplayState = overrideState || surveyState;
    const newState = currentDisplayState === 'inProgress' ? 'completed' : 'inProgress';
    setOverrideState(newState);
    onStateChange(newState);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('surveyDisplayState', newState);
    }
  };

  const displayState = overrideState || surveyState;

// viewPropsの安全性確保
const safeViewProps = {
  currentRate: viewProps.currentRate || 0,
  rateHistory: viewProps.rateHistory || [],
  challengeData: viewProps.challengeData || [],
  challengeCategories: viewProps.challengeCategories || [],
  selectedDept: viewProps.selectedDept || '',
  setSelectedDept: viewProps.setSelectedDept || (() => {}),
  selectedSurveyDate: viewProps.selectedSurveyDate || '',
  setSelectedSurveyDate: viewProps.setSelectedSurveyDate || (() => {}),
  allSurveyDates: viewProps.allSurveyDates || [],
  categories: viewProps.categories || [],
  currentData: viewProps.currentData || {},
  departmentSummaryData: viewProps.departmentSummaryData || {},
  mergedData: viewProps.mergedData || [],
  comparisonPeriod: viewProps.comparisonPeriod || '前回',
  setComparisonPeriod: viewProps.setComparisonPeriod || (() => {}),
  engagementSurveyData: viewProps.engagementSurveyData || [],
  managerScoreData: viewProps.managerScoreData || [],
  questionData: viewProps.questionData || [],
  allImprovementItems: viewProps.allImprovementItems || [],
  improvementPlans: viewProps.improvementPlans || [],
  calculatePredictionValue: viewProps.calculatePredictionValue || (() => {}),
  getChartData: viewProps.getChartData || (() => []),
  insightTexts: viewProps.insightTexts || [],
  tenant_id: viewProps.tenant_id || null,
  department_id: viewProps.department_id || null
};

  // scoreDataの安全性確保
  const safeScoreData = {
    score: scoreData?.score || 0,
    prevDiff: scoreData?.prevDiff || '0',
    companyAvg: scoreData?.companyAvg || '0',
    rating: scoreData?.rating || 0,
    ratingLabel: scoreData?.ratingLabel || '-',
    history: scoreData?.history || [],
    setSelectedYears: scoreData?.setSelectedYears || (() => {}),
    selectedYears: scoreData?.selectedYears || 1,
    tenant_id: scoreData?.tenant_id || null,
    department_id: scoreData?.department_id || null
  };

  if (displayState === 'loading') {
    return <div className="p-8 text-center">サーベイ状態を読み込み中...</div>;
  }

  return (
    <>
      <SurveyStatusBanner surveyState={displayState} surveyData={surveyData || {}} />

      {showToggle && (
        <div className="flex justify-end mr-6 mb-4">
          <button
            onClick={toggleDisplayMode}
            className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700"
          >
            {displayState === 'inProgress'
              ? '完了表示に切替'
              : '回答中表示に切替'}
          </button>
        </div>
      )}

      {displayState === 'inProgress' ? (
        <SurveyInProgressView {...safeViewProps} scoreData={safeScoreData} />
      ) : (
        <SurveyCompletedView {...safeViewProps} scoreData={safeScoreData} />
      )}
    </>
  );
};

export default SurveyStatusView;