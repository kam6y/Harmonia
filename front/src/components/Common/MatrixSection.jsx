import React from 'react'
import QuadrantMatrix from '../../components/manager/4QuadrantMatrix'
import QuadrantMatrixDetails from '../../components/manager/QuadrantMatrixDetails'

/**
 * マトリックスと詳細情報を表示するセクション
 * 
 * @param {Object} props
 * @param {string} props.selectedDept - 選択された部署名
 * @param {function} props.setSelectedDept - 部署選択を更新する関数
 * @param {string} props.selectedSurveyDate - 選択されたサーベイ日付
 * @param {function} props.setSelectedSurveyDate - サーベイ日付選択を更新する関数
 * @param {Array} props.allSurveyDates - 利用可能なすべてのサーベイ日付
 * @param {Array} props.categories - カテゴリー一覧
 * @param {Object} props.currentData - 現在の表示データ
 * @param {Object} props.departmentSummaryData - 部門サマリーデータ
 * @param {boolean} props.showDepartmentSelector - 部門選択機能を表示するかどうか
 */
const MatrixSection = ({
  selectedDept,
  setSelectedDept,
  selectedSurveyDate,
  setSelectedSurveyDate,
  allSurveyDates,
  categories,
  currentData,
  departmentSummaryData,
  showDepartmentSelector = true,
}) => {
  return (
    <div className="p-6 pt-0 w-full">
      {/* マトリックスと詳細情報を横並びに */}
      <div className="flex flex-col md:flex-row">
        {/* 左側：4象限マトリクス */}
        <div className="w-full md:w-2/5 pr-0 md:pr-10 mb-6 md:mb-0">
          <div className="w-full h-auto aspect-square">
            <QuadrantMatrix
              selectedDept={selectedDept}
              setSelectedDept={setSelectedDept}
              selectedSurveyDate={selectedSurveyDate}
              setSelectedSurveyDate={setSelectedSurveyDate}
              allSurveyDates={allSurveyDates}
              categories={categories}
              departmentData={currentData}
              showDepartmentSelector={showDepartmentSelector}
              isIssueView={true}
            />
          </div>
        </div>

        {/* 右側：詳細情報 */}
        <div className="w-full md:w-3/5 h-auto mt-12">
          <QuadrantMatrixDetails
            selectedDept={selectedDept}
            departmentData={departmentSummaryData}
          />
        </div>
      </div>
    </div>
  )
}

export default MatrixSection