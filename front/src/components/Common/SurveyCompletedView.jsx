// front/src/components/common/SurveyCompletedView.jsx
import React from 'react'
import QuestionnaireScore from '../../components/common/QuestionnaireScore'
import ResponseRateSection from './ResponseRateSection'
import MatrixSection from './MatrixSection'
import ChallengeList from '../../components/manager/ChallengeList'
import EngagementSurveyChart from '../../components/common/EngagementSurveyChart'

/**
 * SurveyCompletedView コンポーネント
 * ・サーベイ回答期間終了後の表示を担当
 * ・スコア表示、回答率推移、マトリックス、エンゲージメントサーベイチャート、課題一覧を含む
 * 
 * @param {Object} props
 * @param {Object} props.scoreData - QuestionnaireScore に渡すスコアデータ
 * @param {number} props.currentRate - 現在の回答率
 * @param {Array} props.rateHistory - 回答率履歴データ
 * @param {string} props.selectedDept - 選択された部署
 * @param {function} props.setSelectedDept - 部署選択を更新する関数
 * @param {string} props.selectedSurveyDate - 選択されたサーベイ日付
 * @param {function} props.setSelectedSurveyDate - サーベイ日付を更新する関数
 * @param {Array} props.allSurveyDates - 全サーベイ日付リスト
 * @param {Array} props.categories - カテゴリー一覧
 * @param {Object} props.currentData - 現在の部署データ
 * @param {Object} props.departmentSummaryData - 部門サマリーデータ
 * @param {Array} props.mergedData - 結合されたスコアデータ
 * @param {string} props.comparisonPeriod - 比較期間
 * @param {function} props.setComparisonPeriod - 比較期間を更新する関数
 * @param {Array} props.challengeData - 課題データ
 * @param {Array} props.challengeCategories - 課題カテゴリーリスト
 * @param {Array} [props.engagementSurveyData=[]] - エンゲージメントサーベイデータ
 * @param {Array} [props.managerScoreData=[]] - 管理者スコアデータ
 * @param {Array} [props.questionData=[]] - 質問データ
 * @param {Array} [props.allImprovementItems=[]] - 改善項目データ
 * @param {Function} [props.calculatePredictionValue=()=>{}] - 予測値計算関数
 * @param {Function} [props.getChartData=()=>{}] - チャートデータ取得関数
 * @param {Array} [props.insightTexts=[]] - インサイトテキストデータ
 * @param {string} [props.tenant_id=null] - テナントID
 * @param {string} [props.department_id=null] - 部署ID
 */
const SurveyCompletedView = ({
  scoreData,
  currentRate,
  rateHistory,
  selectedDept,
  setSelectedDept,
  selectedSurveyDate,
  setSelectedSurveyDate,
  allSurveyDates,
  categories,
  currentData,
  departmentSummaryData,
  mergedData,
  comparisonPeriod,
  setComparisonPeriod,
  challengeData,
  challengeCategories,
  engagementSurveyData = [],
  managerScoreData = [],
  questionData = [],
  allImprovementItems = [],
  // 以下のプロパティにデフォルト値を設定
  calculatePredictionValue = () => {},
  getChartData = () => [],
  insightTexts = [],
  tenant_id = null,
  department_id = null
}) => {
  return (
    <>
      {/* スコア表示セクション */}
      <QuestionnaireScore {...scoreData} />

      {/* 回答率推移セクション */}
      <div className="mx-6 mt-4">
        <ResponseRateSection
          currentRate={currentRate}
          rateComparison="15.0%"
          isPositive={true}
          rateHistory={rateHistory}
          isCompact={false}
        />
      </div>

      {/* マトリックスセクション */}
      <h2 className="text-xl font-bold text-gray-900 ml-6 mt-6 mb-2">
        ４象限マトリックス分析
      </h2>
      <MatrixSection
        selectedDept={selectedDept}
        setSelectedDept={setSelectedDept}
        selectedSurveyDate={selectedSurveyDate}
        setSelectedSurveyDate={setSelectedSurveyDate}
        allSurveyDates={allSurveyDates}
        categories={categories}
        currentData={currentData}
        departmentSummaryData={departmentSummaryData}
        showDepartmentSelector={false}
      />

      {/* 課題一覧・新規登録セクション */}
      <div className="mx-2 my-6">
        <ChallengeList
          challenges={challengeData}
          categories={challengeCategories}
        />
      </div>

      {/* エンゲージメントサーベイチャート */}
      {engagementSurveyData && engagementSurveyData.length > 0 && (
        <div className="mb-6">
          <EngagementSurveyChart
            selectedOrganization={selectedDept || '営業部'}
            engagementSurveyData={engagementSurveyData}
            managerScoreData={managerScoreData}
            questionData={questionData}
            allImprovementItems={allImprovementItems}
            // improvementPlansは、省略しても良いプロパティなので空配列をデフォルト値として渡す
            improvementPlans={[]}
            calculatePredictionValue={calculatePredictionValue}
            getChartData={getChartData}
            insightTexts={insightTexts}
            tenant_id={tenant_id}
            department_id={department_id}
          />
        </div>
      )}
    </>
  )
}

export default SurveyCompletedView