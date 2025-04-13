import React, { useState, useMemo, useEffect } from 'react'
import CategoryScoreTable from '@/components/common/CategoryScoreTable'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

const PulseSurveyChart = ({
                            selectedOrganization,
                            pulseSurveyData,
                            managerScoreData,
                            questionData,
                            allImprovementItems,
                          }) => {
  // ----------------------------
  // 1. サーベイ対象／対象外項目のグループ化
  // ----------------------------
  // サーベイ対象（in_progress）の項目群を抽出
  const surveyQuestions = useMemo(
      () =>
          allImprovementItems
              .filter((item) => item.status === 'in_progress')
              .map((item) => ({ ...item, inSurvey: true })),
      [allImprovementItems]
  )

  // サーベイ対象外の項目群を抽出
  const nonSurveyQuestions = useMemo(
      () =>
          allImprovementItems
              .filter((item) => item.status !== 'in_progress')
              .map((item) => ({ ...item, inSurvey: false })),
      [allImprovementItems]
  )

  // 同一 ID ごとにグループ化し、カテゴリ（category）とテキスト（texts）の一覧をまとめる
  const groupedSurvey = useMemo(() => {
    const map = new Map()
    surveyQuestions.forEach((q) => {
      if (map.has(q.id)) {
        map.get(q.id).texts.push(q.text)
      } else {
        map.set(q.id, { category: q.category, texts: [q.text] })
      }
    })
    return Array.from(map.entries()).map(([id, group]) => ({
      id,
      category: group.category,
      texts: group.texts,
    }))
  }, [surveyQuestions])

  // ----------------------------
  // 2. その他の状態管理
  // ----------------------------
  // selectedQuestions は最大3件まで（数値のIDの配列）
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [chartMode, setChartMode] = useState('実感値')
  const [scoreMode, setScoreMode] = useState('pulse')
  const [comparisonPeriod, setComparisonPeriod] = useState('前回')
  const [showScoreSection, setShowScoreSection] = useState(true)
  const [showPrediction, setShowPrediction] = useState(false)
  const [showHelpTooltip, setShowHelpTooltip] = useState(false)

  // 初回マウント時に、サーベイ対象項目の先頭3件を自動選択
  useEffect(() => {
    if (groupedSurvey.length > 0 && selectedQuestions.length === 0) {
      const initialSelection = groupedSurvey.slice(0, 3).map((group) => group.id)
      setSelectedQuestions(initialSelection)
    }
  }, [groupedSurvey, selectedQuestions])

  // ----------------------------
  // 3. グラフ描画関連の処理（従来の実装）
  // ----------------------------
  const questionColors = {
    1: { color: '#178394', shape: 'circle' },
    2: { color: '#00A3B3', shape: 'triangle' },
    3: { color: '#004259', shape: 'square' },
    4: { color: '#F29759', shape: 'circle' },
    5: { color: '#FC7F7A', shape: 'triangle' },
    6: { color: '#178394', shape: 'diamond' },
    7: { color: '#00A3B3', shape: 'circle' },
    8: { color: '#004259', shape: 'triangle' },
    9: { color: '#F29759', shape: 'square' },
    10: { color: '#FC7F7A', shape: 'circle' },
    11: { color: '#178394', shape: 'triangle' },
    12: { color: '#00A3B3', shape: 'square' },
    13: { color: '#004259', shape: 'circle' },
    14: { color: '#F29759', shape: 'triangle' },
    15: { color: '#FC7F7A', shape: 'square' },
    16: { color: '#178394', shape: 'diamond' },
  }

  const getShapeForQuestion = (questionId) => {
    const shapes = {
      circle: 'circle',
      triangle: 'triangle',
      square: 'rect',
      diamond: 'diamond',
    }
    return shapes[questionColors[questionId]?.shape] || 'circle'
  }

  const getDataKey = (questionId) => {
    switch (chartMode) {
      case '実感値':
        return `satisfaction${questionId}`
      case '期待値':
        return `expectation${questionId}`
      case 'GAP':
        return `gap${questionId}`
      default:
        return `satisfaction${questionId}`
    }
  }

  const getPredictionKey = (questionId) => {
    switch (chartMode) {
      case '実感値':
        return `predictionSatisfaction${questionId}`
      case '期待値':
        return `predictionExpectation${questionId}`
      case 'GAP':
        return `predictionGap${questionId}`
      default:
        return `predictionSatisfaction${questionId}`
    }
  }

  // 線形回帰等の予測ロジックは従来の実装のまま
  const computeLinearRegression = (dataPoints) => {
    const n = dataPoints.length
    if (n === 0) return { slope: 0, intercept: 0 }
    let sumX = 0,
        sumY = 0,
        sumXY = 0,
        sumXX = 0
    dataPoints.forEach((pt) => {
      sumX += pt.x
      sumY += pt.y
      sumXY += pt.x * pt.y
      sumXX += pt.x * pt.x
    })
    const xMean = sumX / n
    const yMean = sumY / n
    const numerator = dataPoints.reduce((acc, pt) => acc + (pt.x - xMean) * (pt.y - yMean), 0)
    const denominator = dataPoints.reduce((acc, pt) => acc + (pt.x - xMean) ** 2, 0)
    const slope = denominator !== 0 ? numerator / denominator : 0
    const intercept = yMean - slope * xMean
    return { slope, intercept }
  }

  const getChartData = () => {
    const data = [...questionData]
    if (!data || data.length === 0) return data

    if (showPrediction && data.length > 0) {
      const latestSurvey = data[data.length - 1]
      const nextSurveyNumber = latestSurvey.id + 1

      const regressions = {}
      selectedQuestions.forEach((qId) => {
        const key = getDataKey(qId)
        const dataPoints = data
            .filter((item) => item[key] != null)
            .map((item) => ({ x: item.id, y: item[key] }))
        if (dataPoints.length > 1) {
          regressions[qId] = computeLinearRegression(dataPoints)
        } else if (dataPoints.length === 1) {
          regressions[qId] = { slope: 0, intercept: dataPoints[0].y }
        }
      })

      const updatedData = data.map((item) => {
        const newItem = { ...item }
        selectedQuestions.forEach((qId) => {
          if (regressions[qId]) {
            const { slope, intercept } = regressions[qId]
            newItem[getPredictionKey(qId)] = Math.min(5, intercept + slope * item.id)
          }
        })
        return newItem
      })

      const predictionData = {
        id: nextSurveyNumber,
        date: '予測',
        isPrediction: true,
      }
      selectedQuestions.forEach((qId) => {
        if (regressions[qId]) {
          const { slope, intercept } = regressions[qId]
          const predictedValue = Math.min(5, intercept + slope * nextSurveyNumber)
          predictionData[getDataKey(qId)] = predictedValue
          predictionData[getPredictionKey(qId)] = predictedValue
        }
      })

      return [...updatedData, predictionData]
    }
    return data
  }

  const chartData = getChartData()

  // ----------------------------
  // 4. チェックボックスのトグル処理（最大3件まで選択）
  // ----------------------------
  const toggleQuestionSelection = (questionId) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter((id) => id !== questionId))
    } else {
      if (selectedQuestions.length < 3) {
        setSelectedQuestions([...selectedQuestions, questionId])
      } else {
        alert('選択できる設問は最大3件までです。')
      }
    }
  }

  // X軸ラベルのフォーマッター（従来通り）
  const formatXAxisTick = (value) => {
    // チャートデータが存在し、将来予測が有効な場合、最後のデータポイントの x 座標なら「次回予測値」と表示
    if (showPrediction && chartData && chartData.length > 0 && value === chartData[chartData.length - 1].id) {
      return '次回予測値'
    }
    return value
  }


  return (
      <div className="mt-6 px-6 pb-6">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold text-brand-darkBlue mr-4 mb-2">
            パルスサーベイ結果推移
          </h2>
          <button
              onClick={() => setShowScoreSection(!showScoreSection)}
              className="bg-brand-darkBlue mb-2 text-white px-4 py-2 rounded-md hover:bg-brand-teal transition-colors"
          >
            {showScoreSection ? 'スコア一覧を非表示' : 'スコア一覧を表示'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              {/* 将来予測切替スイッチ（従来の実装） */}
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-2">将来予測:</span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                      type="checkbox"
                      checked={showPrediction}
                      onChange={() => setShowPrediction(!showPrediction)}
                      className="sr-only peer"
                  />
                  <div className="relative w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-cyan"></div>
                </label>
                <div className="relative ml-2">
                  <div
                      className="w-5 h-5 flex items-center justify-center bg-brand-lightGray text-brand-darkBlue rounded-full cursor-help"
                      onMouseEnter={() => setShowHelpTooltip(true)}
                      onMouseLeave={() => setShowHelpTooltip(false)}
                  >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  {showHelpTooltip && (
                      <div className="absolute left-0 bottom-8 w-64 p-3 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <div className="text-xs text-gray-700">
                          <p className="font-bold mb-1 text-brand-darkBlue">将来予測とは</p>
                          <p className="mb-2">
                            現在の施策の推移から線形回帰を用いて、次回のサーベイでの予測値を算出します。
                          </p>
                          <p className="mb-2">
                            <span className="font-medium text-brand-teal">役立つ場面：</span>
                            <br />
                            ・施策のトレンド分析
                            <br />
                            ・今後の改善指標の参考
                          </p>
                        </div>
                        <div className="absolute -bottom-2 left-1 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
                      </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                  className={`px-3 py-1 text-sm rounded-md ${
                      chartMode === '実感値'
                          ? 'bg-brand-teal text-white'
                          : 'bg-brand-lightGray text-gray-700'
                  }`}
                  onClick={() => setChartMode('実感値')}
              >
                実感値
              </button>
              <button
                  className={`px-3 py-1 text-sm rounded-md ${
                      chartMode === '期待値'
                          ? 'bg-brand-teal text-white'
                          : 'bg-brand-lightGray text-gray-700'
                  }`}
                  onClick={() => setChartMode('期待値')}
              >
                期待値
              </button>
              <button
                  className={`px-3 py-1 text-sm rounded-md ${
                      chartMode === 'GAP'
                          ? 'bg-brand-teal text-white'
                          : 'bg-brand-lightGray text-gray-700'
                  }`}
                  onClick={() => setChartMode('GAP')}
              >
                GAP
              </button>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="id"
                    label={{ value: '(回目)', position: 'insideBottomRight', offset: -25 }}
                    tickFormatter={formatXAxisTick}
                    tickMargin={10}
                />
                <YAxis
                    domain={chartMode === 'GAP' ? [-4, 4] : [1, 5]}
                    label={{
                      value: chartMode === 'GAP' ? '目標値 0' : '評価 (1-5)',
                      position: 'insideLeft',
                      angle: -90,
                      dy: 30,
                    }}
                />
                <Tooltip
                    formatter={(value, name, props) => {
                      if (props.payload.isPrediction) {
                        return [`${parseFloat(value).toFixed(1)} (予測)`, name]
                      }
                      return parseFloat(value).toFixed(1)
                    }}
                    labelFormatter={(label, items) => {
                      const item = items[0]?.payload
                      if (showPrediction && chartData && chartData.length > 0 && label === chartData[chartData.length - 1].id) {
                        return item?.isPrediction ? `次回予測値 (予測)` : `次回予測値`
                      }
                      return item?.isPrediction ? `${label}回目 (予測)` : `${label}回目`
                    }}
                />

                <Legend />
                {chartMode === 'GAP' && <ReferenceLine y={0} stroke="#000" strokeWidth={1} />}
                {/* 選択された設問の折れ線 */}
                {selectedQuestions.map((qId) => (
                    <Line
                        key={qId}
                        type="monotone"
                        dataKey={getDataKey(qId)}
                        name={`設問${qId}`}
                        stroke={questionColors[qId]?.color}
                        strokeWidth={2}
                        dot={(props) => {
                          if (props.payload.isPrediction) {
                            return (
                                <svg x={props.cx - 5} y={props.cy - 5} width={10} height={10}>
                                  <circle
                                      cx={5}
                                      cy={5}
                                      r={5}
                                      fill="white"
                                      stroke={questionColors[qId]?.color}
                                      strokeWidth={2}
                                  />
                                </svg>
                            )
                          }
                          return (
                              <svg x={props.cx - 5} y={props.cy - 5} width={10} height={10}>
                                {getShapeForQuestion(qId) === 'circle' ? (
                                    <circle cx={5} cy={5} r={5} fill={questionColors[qId]?.color} />
                                ) : getShapeForQuestion(qId) === 'triangle' ? (
                                    <polygon points="5,0 10,10 0,10" fill={questionColors[qId]?.color} />
                                ) : getShapeForQuestion(qId) === 'rect' ? (
                                    <rect width={10} height={10} fill={questionColors[qId]?.color} />
                                ) : (
                                    <polygon points="5,0 10,5 5,10 0,5" fill={questionColors[qId]?.color} />
                                )}
                              </svg>
                          )
                        }}
                        connectNulls
                        isAnimationActive={false}
                    />
                ))}
                {/* 予測値（点線） */}
                {showPrediction &&
                    selectedQuestions.map((qId) => {
                      const lastDataIndex = chartData.findIndex((d) => d.isPrediction)
                      if (lastDataIndex <= 0) return null
                      return (
                          <Line
                              key={`prediction-${qId}`}
                              type="monotone"
                              dataKey={getPredictionKey(qId)}
                              name={`設問${qId} (予測)`}
                              stroke={questionColors[qId]?.color}
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              connectNulls
                              isAnimationActive={false}
                              legendType="none"
                              dot={false}
                          />
                      )
                    })}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ▼ サーベイ対象項目の表示 ▼ */}
          <div className="mb-4 mt-4">
            <h3 className="text-base font-bold text-gray-800 mb-2">パルスサーベイ対象項目</h3>
            <div className="flex flex-row flex-wrap gap-4">
              {groupedSurvey.map((group) => (
                  <div
                      key={group.id}
                      className="bg-brand-lightGray px-3 py-2 rounded text-sm text-gray-800 w-64"
                  >
                    <label className="flex items-center cursor-pointer">
                      <input
                          type="checkbox"
                          className="mr-2"
                          checked={selectedQuestions.includes(group.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (selectedQuestions.length < 3) {
                                setSelectedQuestions([...selectedQuestions, group.id])
                              } else {
                                alert('選択できる設問は最大3件までです。')
                              }
                            } else {
                              setSelectedQuestions(selectedQuestions.filter((id) => id !== group.id))
                            }
                          }}
                      />
                      <span className="font-semibold">{group.category}(設問{group.id})</span>
                    </label>
                    <ul className="list-disc ml-5 mt-1">
                      {group.texts.map((text, i) => (
                          <li key={i}>{text}</li>
                      ))}
                    </ul>
                  </div>
              ))}
            </div>
          </div>

          {/* ▼ パルスサーベイ対象外項目の表示 ▼ */}
          <div className="mt-2 max-h-48 overflow-y-auto pr-1">
            <h3 className="text-base font-bold mb-2 text-gray-800">パルスサーベイ対象外項目</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
              {nonSurveyQuestions.map((question) => (
                  <div
                      key={question.id}
                      className="flex items-center p-1 rounded text-xs text-gray-500"
                  >
                    <div className="w-3 h-3 min-w-3 mr-1 rounded-sm bg-gray-300"></div>
                    <span className="truncate">{question.text}</span>
                  </div>
              ))}
            </div>
          </div>

          <div className="mt-1 text-xs text-gray-600">
            ※ グラフにはすべての設問を表示できます
          </div>

          {/* ----------------------------
            スコア一覧セクション（従来の実装）
          ---------------------------- */}
          {showScoreSection && (
              <div className="mb-6">
                <div className="flex justify-start items-center ml-4 mt-10 ">
                  <div className="flex space-x-2 ">
                    <button
                        className={`px-4 py-2 text-sm rounded-md ${
                            scoreMode === 'pulse'
                                ? 'bg-brand-cyan text-white'
                                : 'bg-brand-lightGray text-gray-700'
                        }`}
                        onClick={() => setScoreMode('pulse')}
                    >
                      パルスサーベイ
                    </button>
                    <button
                        className={`px-4 py-2 text-sm rounded-md ${
                            scoreMode === 'manager'
                                ? 'bg-brand-cyan text-white'
                                : 'bg-brand-lightGray text-gray-700'
                        }`}
                        onClick={() => setScoreMode('manager')}
                    >
                      管理者スコア
                    </button>
                  </div>
                </div>
                <CategoryScoreTable
                    mergedData={scoreMode === 'pulse' ? pulseSurveyData : managerScoreData}
                    comparisonPeriod={comparisonPeriod}
                    setComparisonPeriod={setComparisonPeriod}
                />
              </div>
          )}
        </div>
      </div>
  )
}

export default PulseSurveyChart
