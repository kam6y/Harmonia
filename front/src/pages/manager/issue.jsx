// front/src/pages/manager/issue.jsx
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import ManagerHeader from '../../components/manager/ManagerHeader'
import AnalysisImprovementHeader from '@/components/common/AnalysisImprovementHeader'
import LastUpdatedInfo from '../../components/common/LastUpdatedInfo'
import SurveyStatusView from '../../components/common/SurveyStatusView'

/**
 * 管理者用の課題ダッシュボードコンポーネント
 */
const ManagerIssue = () => {
  // 基本データの状態管理
  const [departmentId, setDepartmentId] = useState(null)
  const [selectedDept, setSelectedDept] = useState(null)
  const [selectedSurveyDate, setSelectedSurveyDate] = useState(null)
  const [allSurveyDates, setAllSurveyDates] = useState([])
  const [categories, setCategories] = useState([])

  // スコアと履歴データ
  const [fullHistory, setFullHistory] = useState(null)
  const [latestScore, setLatestScore] = useState(null)
  const [selectedYears, setSelectedYears] = useState(1)

  // マトリックス・グラフデータ
  const [departmentData, setDepartmentData] = useState({})
  const [currentData, setCurrentData] = useState({})
  const [departmentSummaryData, setDepartmentSummaryData] = useState({})

  // サーベイ・回答率データ
  const [comparisonPeriod, setComparisonPeriod] = useState('前回')
  const [challengeData, setChallengeData] = useState([])
  const [rateHistory, setRateHistory] = useState([])
  const [currentRate, setCurrentRate] = useState(0)

  // 追加コンポーネント用のデータ
  const [engagementSurveyData, setEngagementSurveyData] = useState([])
  const [managerScoreData, setManagerScoreData] = useState([])
  const [insightTexts, setInsightTexts] = useState([])

  // API関連の状態
  const [apiData, setApiData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // 再生成を防ぐためのフラグ
  const dataGenerated = useRef(false)

  // 初期サーベイ状態の取得（ローカルストレージから取得）
  const [initialSurveyState, setInitialSurveyState] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('surveyDisplayState')
      return savedState || 'loading'
    }
    return 'loading'
  })

  // 現在の表示状態の管理
  const [currentViewState, setCurrentViewState] = useState(initialSurveyState)

  // URLパラメータから部署IDを取得
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search)
      const deptId = queryParams.get('departmentId')
      if (deptId) {
        setDepartmentId(deptId)
      }
    }
  }, [])

  // 部署IDが設定されたら API からデータを取得
  useEffect(() => {
    if (departmentId) {
      fetchData()
    }
  }, [departmentId])

  // APIからデータを取得する関数
  const fetchData = async () => {
    try {
      if (isLoading) return // 既にロード中の場合は中断

      setIsLoading(true)
      const tenantId = typeof window !== 'undefined'
        ? localStorage.getItem('tenant_id')
        : null

      if (!tenantId) {
        throw new Error('テナントIDが見つかりません。再ログインしてください。')
      }

      console.log(`API呼び出し: 部門ID ${departmentId} でデータ取得を開始`)

      // APIエンドポイントにリクエスト
      const response = await axios.get(
        `http://localhost/api/manager/issue-data/${departmentId}`
      )

      console.log('API応答データ:', response.data)

      if (response.data.success) {
        console.log('API呼び出し成功: データを設定します')
        const data = response.data.data
        setApiData(data)

        // 部署データの設定
        if (data.department) {
          console.log('部署データを設定:', data.department.name)
          setSelectedDept(data.department.name)
        }

        // サーベイ日付データの設定
        if (
          data.surveyDates &&
          Array.isArray(data.surveyDates) &&
          data.surveyDates.length > 0
        ) {
          console.log('サーベイ日時データを設定:', data.surveyDates)
          setAllSurveyDates(data.surveyDates)
          setSelectedSurveyDate(data.surveyDates[0]) // 最新のサーベイ日付を選択
        }

        // マトリクスデータの設定
        if (data.matrixData) {
          console.log('マトリクスデータを設定:', Object.keys(data.matrixData))
          setDepartmentData(data.matrixData)
          dataGenerated.current = true
        }

        // 部署サマリーデータの設定
        if (data.departmentSummary) {
          console.log(
            '部署概要データを設定:',
            Object.keys(data.departmentSummary)
          )
          setDepartmentSummaryData(data.departmentSummary)
        }

        // スコアデータと履歴の設定
        if (
          data.scoreData &&
          data.scoreData.history &&
          Array.isArray(data.scoreData.history)
        ) {
          console.log('スコアデータと履歴を設定')
          setFullHistory(data.scoreData.history)
          const filteredHistory = data.scoreData.history.slice(
            -(selectedYears * 2 + 1)
          )
          setLatestScore(
            filteredHistory.length > 0
              ? filteredHistory[filteredHistory.length - 1].score
              : 0
          )
        }

        // サーベイ状態の設定
        if (data.surveyStatus) {
          console.log('サーベイ状態を設定:', data.surveyStatus.state)
          setInitialSurveyState(data.surveyStatus.state)
          setCurrentViewState(data.surveyStatus.state)
        }

        // 課題データの設定
        if (data.challengeData && Array.isArray(data.challengeData)) {
          console.log('課題データを設定:', data.challengeData.length, '件')
          const mappedChallenges = data.challengeData.map((ch) => ({
            id: ch.id, // ID
            category: ch.issue_category, // 課題のカテゴリー
            challenge: ch.issue_text, // 課題内容
            measureCount: ch.measureCount ?? 0,
          }))
          setChallengeData(mappedChallenges)
        }

        // カテゴリーデータの設定
        if (data.questions && Array.isArray(data.questions)) {
          console.log('カテゴリーデータを設定:', data.questions.length, '件')
          setCategories(
            data.questions.map((q) => ({
              id: q.id,
              category: q.category,
            }))
          )
        }

        // 回答率データの設定
        if (data.responseRate !== undefined) {
          console.log('回答率データを設定:', data.responseRate)
          setCurrentRate(data.responseRate)
        }

        // 回答率履歴の設定
        if (data.rateHistory && Array.isArray(data.rateHistory)) {
          console.log('回答率履歴を設定:', data.rateHistory.length, '件')
          setRateHistory(data.rateHistory)
        }

        // インサイトテキストの設定
        if (data.insightTexts && Array.isArray(data.insightTexts)) {
          console.log('インサイトテキストを設定:', data.insightTexts.length, '件')
          setInsightTexts(data.insightTexts)
        }

        // エンゲージメントサーベイデータの設定
        if (data.engagementSurveyData) {
          console.log('エンゲージメントサーベイデータを設定')
          setEngagementSurveyData(data.engagementSurveyData)
        }

        // マネージャースコアデータの設定
        if (data.managerScoreData) {
          console.log('マネージャースコアデータを設定')
          setManagerScoreData(data.managerScoreData)
        }

        console.log('API処理完了: すべてのデータを設定しました')
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

  // 選択されたサーベイ日付が変更された場合に表示データを更新
  useEffect(() => {
    if (
      selectedSurveyDate &&
      departmentData &&
      departmentData[selectedSurveyDate]
    ) {
      setCurrentData(departmentData[selectedSurveyDate])
    }
  }, [selectedSurveyDate, departmentData])

  // 履歴データのフィルタリング（selectedYears変更時）
  useEffect(() => {
    if (fullHistory && Array.isArray(fullHistory) && fullHistory.length > 0) {
      const filteredHistory = fullHistory.slice(-(selectedYears * 2 + 1))
      setLatestScore(
        filteredHistory.length > 0
          ? filteredHistory[filteredHistory.length - 1].score
          : 0
      )
    }
  }, [selectedYears, fullHistory])

  // 表示状態の変更時にローカルストレージへ記録し状態更新
  const handleStateChange = (newState) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('surveyDisplayState', newState)
    }
    setCurrentViewState(newState)
  }

  // ローディング中・エラー発生時の表示
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
  if (error) {
    return <div className="p-8 text-center text-red-500">エラー: {error}</div>
  }

  // データの有無確認（無限ループ防止のため）
  const hasData = Boolean(fullHistory && fullHistory.length > 0)

  // チャレンジカテゴリー選択肢データの設定
  const challengeCategories = categories.map((cat) => ({
    id: cat.id.toString(),
    name: cat.category,
  }))

  // MatrixSection コンポーネント用にデータを整形
  const getMatrixData = () => {
    if (!selectedSurveyDate || !departmentData) return {}
    if (departmentData[selectedSurveyDate]) {
      return {
        [selectedDept]: departmentData[selectedSurveyDate],
      }
    }
    return {}
  }

  // QuestionnaireScore コンポーネントへ渡すスコアデータ
  const finalScoreData = {
    score: apiData?.scoreData?.score || latestScore || 0,
    prevDiff: apiData?.scoreData?.prevDiff || 0,
    companyAvg: apiData?.scoreData?.companyAvg
      ? `${apiData.scoreData.companyAvg.toFixed(1)}${apiData.scoreData.companyDiff ? ` (${apiData.scoreData.companyDiff > 0 ? '+' : ''}${apiData.scoreData.companyDiff.toFixed(1)})` : ''}`
      : '58.9 (-3.6)',
    rating: apiData?.scoreData?.rating || 55,
    ratingLabel: apiData?.scoreData?.ratingLabel || 'BB',
    history: fullHistory || [],
    setSelectedYears,
    selectedYears,
  }

  // 選択されたサーベイ日付に対応するサマリーデータの抽出
  const summaryForSurveyDate =
    selectedSurveyDate &&
    departmentSummaryData &&
    departmentSummaryData[selectedSurveyDate]
      ? departmentSummaryData[selectedSurveyDate]
      : {
          strong: ['データがありません'],
          weak: ['データがありません'],
          summary: '選択された日付のサマリーデータが見つかりません。',
          companyAvg: 0,
          departmentAvg: 0,
        }

  // QuadrantMatrixDetails用にキーを selectedDept に変更して整形
  const transformedSummaryData = {
    [selectedDept]: summaryForSurveyDate,
  }

  // テナントIDの取得（ローカルストレージから）
  const tenantId = typeof window !== 'undefined'
    ? localStorage.getItem('tenant_id') || '1'
    : '1'

  // SurveyStatusView コンポーネントへ渡す props の設定
  const viewProps = {
    currentRate,
    rateHistory,
    challengeData,
    challengeCategories,
    selectedDept,
    setSelectedDept,
    selectedSurveyDate,
    setSelectedSurveyDate,
    allSurveyDates,
    categories: categories.map((cat) => cat.category),
    currentData: getMatrixData(),
    departmentSummaryData: transformedSummaryData,
    comparisonPeriod,
    setComparisonPeriod,
    engagementSurveyData,
    managerScoreData,
    insightTexts,
    getChartData: () => [],
    calculatePredictionValue: () => 3.5,
    improvementPlans: [],
    allImprovementItems: categories.map((cat) => ({
      id: cat.id,
      text: cat.category,
      inSurvey: true,
    })),
    questionData: [],
    tenant_id: tenantId,
    department_id: departmentId,
  }

  // コンポーネントの表示
  return (
    <div className="bg-brand-lightGray min-h-screen flex flex-col">
      {/* ヘッダー */}
      <ManagerHeader showNav={true} showTenantName={true} />
      <AnalysisImprovementHeader
        analysisPath="/manager/dashboard_survey"
        improvementPath="/manager/dashboard_improvement"
      />
      {/* 組織ヘッダーと最終更新日 */}
      <div className="flex justify-between items-center mt-24 mb-4">
        <h2 className="text-xl font-bold pl-6 pt-4 text-gray-900 flex items-center">
          <svg
            className="w-6 h-6 mr-2 text-brand-teal"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.62c0-1.17.68-2.25 1.76-2.73 1.17-.51 2.61-.9 4.24-.9zM18 2v6c0 3.31-2.69 6-6 6s-6-2.69-6-6V2h12zm-2 6V4h-8v4c0 2.21 1.79 4 4 4s4-1.79 4-4z" />
          </svg>
          あなたの組織 {selectedDept ? `(${selectedDept})` : ''}
        </h2>
        <div className="pr-6 pt-4">
          {hasData ? (
            <LastUpdatedInfo history={fullHistory} />
          ) : (
            <span>データ取得中...</span>
          )}
        </div>
      </div>

      {/* SurveyStatusView コンポーネント */}
      <SurveyStatusView
        initialState={initialSurveyState}
        surveyData={apiData?.surveyStatus?.surveyData || null}
        viewProps={viewProps}
        scoreData={finalScoreData}
        showToggle={true}
        onStateChange={handleStateChange}
        tenant_id={tenantId}
        department_id={departmentId}
      />
    </div>
  )
}

export default ManagerIssue