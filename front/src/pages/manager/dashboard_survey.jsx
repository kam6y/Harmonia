// front/src/pages/manager/dashboard_survey.jsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import ManagerHeader from '../../components/manager/ManagerHeader'
import AnalysisImprovementHeader from '../../components/common/AnalysisImprovementHeader'
import QuestionnaireScore from '../../components/common/QuestionnaireScore'
import ResponseRateCard from '../../components/manager/ResponseRateCard'
import DepartmentScoreTable from '../../components/manager/DepartmentScoreTable'
import QuadrantMatrix from '../../components/manager/4QuadrantMatrix'
import QuadrantMatrixDetails from '../../components/manager/QuadrantMatrixDetails'
import EmployeeSatisfactionHeatmap from '../../components/common/EmployeeSatisfactionHeatmap'
import EngagementSurveyChart from '../../components/common/EngagementSurveyChart'

// LastUpdatedInfoコンポーネント
const LastUpdatedInfo = ({ history }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '日付なし'
    const date = new Date(dateString)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

  if (!history) {
    return (
      <div className="text-sm text-gray-500 flex items-center">
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>最終更新: 情報なし</span>
      </div>
    )
  }

  const latestSurvey = history && history.length > 0 ? history[0] : null
  const updateDate = latestSurvey?.date || '日付なし'

  return (
    <div className="text-sm text-gray-500 flex items-center">
      <svg
        className="w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>最終更新: {formatDate(updateDate)}</span>
    </div>
  )
}

const ManagerIssue = () => {
  // ステート変数の定義
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [apiData, setApiData] = useState(null)

  const [selectedYears, setSelectedYears] = useState(1)
  const [selectedDept, setSelectedDept] = useState(null)
  const [showHeatmapView, setShowHeatmapView] = useState(true)
  const [selectedSurveyDate, setSelectedSurveyDate] = useState(null)
  

  // 16項目のカテゴリーデータ（質問項目のマスタデータとして使用）
  const unifiedCategories = [
    { id: 1, category: '顧客基盤の安定性' },
    { id: 2, category: '理念戦略への納得感' },
    { id: 3, category: '社会的貢献' },
    { id: 4, category: '責任と顧客・社会への貢献' },
    { id: 5, category: '連帯感と相互尊重' },
    { id: 6, category: '魅力的な上司' },
    { id: 7, category: '勤務地や会社設備の魅力' },
    { id: 8, category: '評価・給与と柔軟な働き方' },
    { id: 9, category: '顧客ニーズや事業戦略の伝達' },
    { id: 10, category: '上司や会社からの理解' },
    { id: 11, category: '公平な評価' },
    { id: 12, category: '上司からの適切な教育・支援' },
    { id: 13, category: '顧客の期待を上回る提案' },
    { id: 14, category: '具体的な目標の共有' },
    { id: 15, category: '未来に向けた活動' },
    { id: 16, category: 'ナレッジの標準化' },
  ]

  // 追加質問のカテゴリー
  const customCategories = [
    { id: 101, category: 'リモートワークの満足度' },
    { id: 102, category: '部署間コミュニケーション' },
    { id: 103, category: '新しい技術導入への理解' },
  ]

  // ローカルストレージからテナントIDと部門IDを取得してデータをロード
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // ローカルストレージからデータを取得
        const tenantId = localStorage.getItem('tenant_id')
        const departmentId = localStorage.getItem('department_id')

        if (!tenantId || !departmentId) {
          throw new Error(
            'テナントIDまたは部署IDが見つかりません。再ログインしてください。'
          )
        }

        // APIリクエスト
        const response = await axios.post(
          'http://localhost/api/dashboard/survey',
          {
            tenant_id: JSON.parse(tenantId),
            department_id: JSON.parse(departmentId),
          }
        )
        console.log('API response:', response.data)

        if (response.data.success) {
          setApiData(response.data.data)
          // 初期選択部署を設定
          if (
            response.data.data.departments &&
            response.data.data.departments.length > 0
          ) {
            setSelectedDept(response.data.data.departments[0].name)
          }
        } else {
          throw new Error(
            response.data.message || 'データ取得中にエラーが発生しました'
          )
        }
      } catch (error) {
        console.error('データ取得エラー:', error)
        setError(error.message || 'データの取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // エンゲージメントサーベイチャート用データ変換
  const transformQuestionDataForChart = () => {
    if (apiData && apiData.trendData && apiData.trendData.scores) {
      const chartData = [];
      const periods = apiData.trendData.periods.slice().sort();
      const departmentName = selectedDept || '全社平均';
    
      periods.forEach((period) => {
        const dataPoint = { period };
    
        unifiedCategories.forEach((category) => {
          const categoryData = apiData.trendData.scores.find(
            (s) =>
              s.period === period &&
              s.department === departmentName &&
              s.category === category.category
          );
          
          if (categoryData) {
            // 値がそのまま正しく表示されるように修正
            if (categoryData.satisfaction != null && !isNaN(categoryData.satisfaction)) {
              // Math.min/Maxによる強制的な制限をなくす
              dataPoint[`satisfaction${category.id}`] = parseFloat(categoryData.satisfaction.toFixed(2));
            }
            
            if (categoryData.expectation != null && !isNaN(categoryData.expectation)) {
              dataPoint[`expectation${category.id}`] = parseFloat(categoryData.expectation.toFixed(2));
            }
            
            if (categoryData.gap != null && !isNaN(categoryData.gap)) {
              dataPoint[`gap${category.id}`] = parseFloat(categoryData.gap.toFixed(2));
            }
          }
        });
        chartData.push(dataPoint);
      });
      return chartData;
    }
    return [];
  };

  const transformedQuestionData = transformQuestionDataForChart()

  // CategoryScoreTable用マージデータ生成
  const createMergedDataForScoreTable = () => {
    if (apiData && apiData.surveyScores) {
      const mergedData = []

      // 選択された部署のデータを抽出
      const deptData = apiData.surveyScores.find(
        (dept) =>
          dept.department === selectedDept ||
          (!selectedDept && dept.department === '全社')
      )

      if (deptData) {
        // デフォルトカテゴリのデータを抽出
        Object.entries(deptData.defaultCategories).forEach(
          ([category, data]) => {
            const categoryId =
              unifiedCategories.find((c) => c.category === category)?.id || 0

            const satisfactionDiff =
              data.satisfactionComparison === 0
                ? null
                : data.satisfactionComparison
            const expectationDiff =
              data.expectationComparison === 0
                ? null
                : data.expectationComparison

            mergedData.push({
              categoryId,
              category,
              question: `${category}に関する質問項目です。`,
              satisfaction: data.satisfaction,
              expectation: data.expectation,
              satisfactionDiff: satisfactionDiff,
              expectationDiff: expectationDiff,
              satisfactionYoyDiff: 0, // APIから取得できない場合のデフォルト値
              expectationYoyDiff: 0, // APIから取得できない場合のデフォルト値
            })
          }
        )

        // カスタムカテゴリのデータを抽出（キーを重複させない）
        Object.entries(deptData.customCategories).forEach(
          ([category, data], index) => {
            const foundCategory = customCategories.find(
              (c) => c.category === category
            )
            const categoryId = foundCategory ? foundCategory.id : 200 + index

            const satisfactionDiff =
              data.satisfactionComparison === 0
                ? null
                : data.satisfactionComparison
            const expectationDiff =
              data.expectationComparison === 0
                ? null
                : data.expectationComparison

            mergedData.push({
              categoryId,
              category,
              question: `${category}に関する質問項目です。`,
              satisfaction: data.satisfaction,
              expectation: data.expectation,
              satisfactionDiff: satisfactionDiff,
              expectationDiff: expectationDiff,
              satisfactionYoyDiff: 0, // APIから取得できない場合のデフォルト値
              expectationYoyDiff: 0, // APIから取得できない場合のデフォルト値
            })
          }
        )

        return mergedData
      }
    }
    return []
  }

  const engagementMergedData = createMergedDataForScoreTable()

  const managerMergedData = createMergedDataForScoreTable().map((item) => ({
    ...item,
    satisfaction: Math.max(
      1,
      Math.min(5, item.satisfaction - 0.3 + Math.random() * 0.6)
    ),
    expectation: Math.max(
      1,
      Math.min(5, item.expectation - 0.2 + Math.random() * 0.4)
    ),
  }))

  // 改善項目を質問選択用フォーマットに変換
  const transformImprovementItemsForQuestions = () => {
    return unifiedCategories.map((cat) => ({
      id: cat.id,
      text: cat.category,
      inSurvey: true,
    }))
  }

  const questionSelectionItems = transformImprovementItemsForQuestions()

  // クアドラントマトリックスデータを取得
  const getQuadrantMatrixData = () => {
    if (
      apiData &&
      apiData.quadrantData &&
      apiData.quadrantData.departmentData
    ) {
      return apiData.quadrantData.departmentData
    }
    return {}
  }

  const departmentData = getQuadrantMatrixData()

  // 部署のサマリーデータを取得
  const getDepartmentSummaryData = () => {
    if (
      apiData &&
      apiData.quadrantData &&
      apiData.quadrantData.departmentSummary
    ) {
      return apiData.quadrantData.departmentSummary
    }
    return {}
  }

  const departmentSummaryData = getDepartmentSummaryData()

  // ヒートマップデータの取得
  const getHeatmapData = () => {
    if (apiData && apiData.surveyScores) {
      return apiData.surveyScores
    }
    return []
  }

  const heatmapData = getHeatmapData()

  // サマリーテキストの取得
  const getSurveyOverallSummary = () => {
    if (apiData && apiData.trendData && apiData.trendData.summaryText) {
      return apiData.trendData.summaryText
    }
    return "ここではヒートマップのサマリーを生成します。"
  }

  const surveyOverallSummary = getSurveyOverallSummary()

  // 部署スコアの取得
  const getDepartmentScores = () => {
    if (apiData && apiData.scoreData && apiData.scoreData.departmentScores) {
      return apiData.scoreData.departmentScores
    }
    return []
  }

  const departmentScores = getDepartmentScores()

  // 回答率データの取得
  const getResponseRates = () => {
    if (apiData && apiData.responseRates) {
      return apiData.responseRates
    }
    return []
  }

  const responseRates = getResponseRates()

  // エラー表示
  if (error) {
    return (
      <div className="bg-brand-lightGray min-h-screen flex flex-col">
        <ManagerHeader showNav={true} showTenantName={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md text-red-600">
            <h2 className="text-xl font-bold mb-4">エラーが発生しました</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // ローディング表示
  if (isLoading) {
    return (
      <div className="bg-brand-lightGray min-h-screen flex flex-col">
        <ManagerHeader showNav={true} showTenantName={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-brand-cyan border-solid mx-auto"></div>
            <p className="mt-4 text-gray-600">データを読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  // スコア履歴の取得
  const getScoreHistory = () => {
    if (apiData && apiData.scoreData && apiData.scoreData.history) {
      return apiData.scoreData.history
    }
    return []
  }

  const scoreHistory = getScoreHistory()

  // スコアデータの取得
  const getScoreData = () => {
    if (apiData && apiData.scoreData) {
      return {
        score: apiData.scoreData.currentScore || 0,
        // 自部署の前回比に差し替え
        prevDiff: apiData.scoreData.prevDiff || 0, 
        companyAvg: `${apiData.scoreData.companyAvg || 0} (${
          apiData.scoreData.companyDiff > 0 ? '+' : ''
        }${apiData.scoreData.companyDiff || 0})`,
        rating: apiData.scoreData.rating || 50,
        ratingLabel: apiData.scoreData.ratingLabel || 'BB',
        history: apiData.scoreData.history || []
      }
    }
    return {}
  }

  const scoreData = getScoreData()  

  // チャートデータ生成関数
  const getChartData = () => {
    const data = [...transformedQuestionData]
    if (!data || data.length === 0) return data

    // 固定のselectedQuestionsを利用
    const latestSurvey = data[data.length - 1]
    const nextSurveyNumber =
      typeof latestSurvey.id === 'number'
        ? latestSurvey.id + 1
        : data.length + 1

    // 予測データに一意のIDを設定
    const predictionData = {
      id: `prediction-${nextSurveyNumber}`, // 一意の文字列IDを設定
      date: '次回',
      isPrediction: true,
    }

    return [...updatedData, predictionData]
  }


  const getInsightTexts = () => {
    if (apiData && apiData.insightTexts) {
      // API から取得したデータをそのまま使用
      return apiData.insightTexts;
    }
    
    // APIデータがない場合やフォールバック
    return [];
  };
    // インサイトテキスト
    const insightTexts = getInsightTexts();
  

  return (
    <div className="bg-brand-lightGray min-h-screen flex flex-col">
      {/* ヘッダー */}
      <ManagerHeader showNav={true} showTenantName={false} />
      <AnalysisImprovementHeader
        analysisPath="/manager/dashboard_survey"
        improvementPath="/manager/dashboard_improvement"
      />

      <div className="flex justify-between items-center">
        <div className="mb-8 w-full mt-24">
          <div className="border-b border-gray-200 pb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold pl-6 pt-4 text-gray-900 flex items-center border-l-4 border-brand-teal">
                <svg
                  className="w-6 h-6 mr-2 text-brand-teal"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.62c0-1.17.68-2.25 1.76-2.73 1.17-.51 2.61-.9 4.24-.9zM18 2v6c0 3.31-2.69 6-6 6s-6-2.69-6-6V2h12zm-2 6V4h-8v4c0 2.21 1.79 4 4 4s4-1.79 4-4z" />
                </svg>
                あなたの組織スコア
              </h2>
              <div className="pr-6 pt-4">
                <LastUpdatedInfo history={scoreHistory} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <QuestionnaireScore
        score={scoreData.score}
        prevDiff={scoreData.prevDiff}
        companyAvg={scoreData.companyAvg}
        rating={scoreData.rating}
        ratingLabel={scoreData.ratingLabel}
        history={scoreData.history}
        setSelectedYears={setSelectedYears}
        selectedYears={selectedYears}
      />

      <div className="w-full flex flex-wrap gap-4 p-6">
        <div className="flex-1">
          <DepartmentScoreTable departmentScores={departmentScores} />
        </div>
        <div className="flex-1">
          <ResponseRateCard responseRates={responseRates} />
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 ml-6 mt-6">
        最新サーベイスコア詳細
      </h2>
      <div className="p-6 w-full">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between mb-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setShowHeatmapView(true)}
                className={`px-4 py-2 rounded-md ${
                  showHeatmapView
                    ? 'bg-brand-teal text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                ヒートマップ表示
              </button>
              <button
                onClick={() => setShowHeatmapView(false)}
                className={`px-4 py-2 rounded-md ${
                  !showHeatmapView
                    ? 'bg-brand-teal text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                リスト表示
              </button>
            </div>
          </div>

          {showHeatmapView && (
            <EmployeeSatisfactionHeatmap
              defaultCategories={unifiedCategories}
              customCategories={customCategories}
              data={heatmapData}
              summaryText={surveyOverallSummary}
            />
          )}

          {!showHeatmapView && (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-brand-teal text-white">
                    <th className="py-2 px-4 text-left">部署</th>
                    <th className="py-2 px-4 text-center">満足度</th>
                    <th className="py-2 px-4 text-center">前回比</th>
                    <th className="py-2 px-4 text-center">期待値</th>
                    <th className="py-2 px-4 text-center">前回比</th>
                    <th className="py-2 px-4 text-center">GAP</th>
                    <th className="py-2 px-4 text-center">前回比</th>
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map((dept) => (
                    <tr key={dept.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 font-medium text-brand-darkBlue">
                        {dept.department}
                      </td>
                      <td className="py-2 px-4 text-center text-brand-darkBlue">
                        {dept.satisfaction?.toFixed(1) || '-'}
                      </td>
                      <td
                        className={`py-2 px-4 text-center ${
                          dept.satisfactionComparison > 0
                            ? 'text-green-600'
                            : dept.satisfactionComparison < 0
                            ? 'text-red-600'
                            : ''
                        }`}
                      >
                        {dept.satisfactionComparison === 0
                          ? '0'
                          : dept.satisfactionComparison > 0
                          ? `+${dept.satisfactionComparison.toFixed(1)}`
                          : dept.satisfactionComparison.toFixed(1)}
                      </td>
                      <td className="py-2 px-4 text-center text-brand-darkBlue">
                        {dept.expectation?.toFixed(1) || '-'}
                      </td>
                      <td
                        className={`py-2 px-4 text-center ${
                          dept.satisfactionComparison > 0
                            ? 'text-green-600'
                            : dept.satisfactionComparison < 0
                            ? 'text-red-600'
                            : ''
                        }`}
                      >
                        {dept.satisfactionComparison === 0
                          ? '0'
                          : dept.satisfactionComparison > 0
                          ? `+${dept.satisfactionComparison.toFixed(1)}`
                          : dept.satisfactionComparison.toFixed(1)}
                      </td>
                      <td className="py-2 px-4 text-center text-brand-darkBlue">
                        {dept.gap?.toFixed(1) || '-'}
                      </td>
                      <td
                        className={`py-2 px-4 text-center ${
                          dept.satisfactionComparison > 0
                            ? 'text-green-600'
                            : dept.satisfactionComparison < 0
                            ? 'text-red-600'
                            : ''
                        }`}
                      >
                        {dept.satisfactionComparison === 0
                          ? '0'
                          : dept.satisfactionComparison > 0
                          ? `+${dept.satisfactionComparison.toFixed(1)}`
                          : dept.satisfactionComparison.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-between">
            <div className="flex space-x-4 pt-4">
              <button className="bg-brand-teal hover:bg-brand-darkBlue text-white px-4 py-2 rounded transition duration-300">
                スコア一覧をダウンロード
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 ml-6 mt-6 mb-2">
          ４象限マトリックス分析
        </h2>
        <div className="px-6 w-full flex flex-col md:flex-row">
          <div className="w-full mb-4">
            <div className="flex flex-wrap gap-2">
              {Object.keys(departmentData).map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                    selectedDept === dept
                      ? 'bg-brand-darkBlue text-white shadow-md'
                      : 'bg-brand-cyan text-white hover:bg-brand-teal'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 w-full flex flex-col md:flex-row">
          <div className="w-full md:w-2/5 pr-0 md:pr-10 mb-6 md:mb-0">
            <QuadrantMatrix
              selectedDept={selectedDept}
              setSelectedDept={setSelectedDept}
              categories={unifiedCategories}
              departmentData={departmentData}
              showSurveyDateSelector={false}
              showDepartmentSelector={false}
            />
          </div>
          <div className="w-full md:w-3/5">
            <QuadrantMatrixDetails
              selectedDept={selectedDept}
              departmentData={departmentSummaryData}
            />
          </div>
        </div>
      </div>

      {/* EngagementSurveyChartコンポーネント */}
      <EngagementSurveyChart
        selectedOrganization={selectedDept}
        engagementSurveyData={engagementMergedData}
        managerScoreData={managerMergedData}
        questionData={transformedQuestionData}
        allImprovementItems={questionSelectionItems}
        improvementPlans={[]}
        getChartData={getChartData}
        insightTexts={insightTexts}
      />
    </div>
  )
}

export default ManagerIssue