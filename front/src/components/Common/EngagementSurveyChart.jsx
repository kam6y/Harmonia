import React, { useState, useMemo } from 'react'
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

// "YYYY-M" や "YYYY-MM" の文字列をタイムスタンプに変換するヘルパー関数
function parsePeriodToTimestamp(period = '') {
    if (typeof period !== 'string' || !period.includes('-')) {
        return NaN
    }
    const [yearStr, monthStr] = period.split('-')
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10)
    if (Number.isNaN(year) || Number.isNaN(month)) {
        return NaN
    }
    return new Date(year, month - 1).getTime()
}

// 月をゼロ埋めするヘルパ関数
function formatMonth(m) {
    return m < 10 ? `0${m}` : `${m}`
}

const EngagementSurveyChart = ({
                                   selectedOrganization,
                                   engagementSurveyData = [],
                                   managerScoreData = [],
                                   questionData = [],
                                   allImprovementItems = [],
                                   improvementPlans,
                                   insightTexts = [],
                               }) => {
    // 内部状態
    const [selectedQuestions, setSelectedQuestions] = useState([1, 2, 3, 4])
    const [chartMode, setChartMode] = useState('満足値')
    const [scoreMode, setScoreMode] = useState('engagement')
    const [comparisonPeriod, setComparisonPeriod] = useState('前回')
    const [showPrediction, setShowPrediction] = useState(false)
    const [showHelpTooltip, setShowHelpTooltip] = useState(false)

    // 質問一覧にフラグを付与
    const allQuestions = useMemo(
        () =>
            allImprovementItems.map((item) => ({
                ...item,
                inSurvey: true,
            })),
        [allImprovementItems]
    )

    // 質問選択トグル
    const toggleQuestionSelection = (questionId) => {
        setSelectedQuestions((prev) =>
            prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
        )
    }

    // 色・形状定義（省略）
    const questionColors = {
        /* ... 省略 ... */
        30: { color: '#E0FBFC', shape: 'triangle' },
    }

    // データキー取得
    const getDataKey = (qId) => {
        if (chartMode === '満足値') return `satisfaction${qId}`
        if (chartMode === '期待値') return `expectation${qId}`
        if (chartMode === 'GAP') return `gap${qId}`
        return `satisfaction${qId}`
    }

    // 予測データ追加
    const addPredictionPoint = (data) => {
        if (!Array.isArray(data) || data.length === 0) return data
        const newPeriod = '2025-4'
        const baseTimestamp = parsePeriodToTimestamp(newPeriod)
        const prediction = { period: newPeriod, isPrediction: true, date: baseTimestamp }

        selectedQuestions.forEach((qId) => {
            const key = getDataKey(qId)
            const vals = data.map((d) => d[key]).filter((v) => typeof v === 'number')
            if (vals.length < 2) {
                prediction[key] = vals[0] ?? 3.5
            } else {
                const last3 = vals.slice(-3)
                const slope = (last3[last3.length - 1] - last3[0]) / (last3.length - 1)
                let pred = vals[vals.length - 1] + slope
                prediction[key] = Math.min(5, Math.max(1, pred))
            }
        })

        return [...data, prediction]
    }

    // チャート用データ整形
    const timeChartData = useMemo(() => {
        const raw = showPrediction ? addPredictionPoint(questionData) : questionData
        return raw
            .map((d) => {
                const date =
                    typeof d.date === 'number' ? d.date : parsePeriodToTimestamp(d.period)
                return { ...d, date }
            })
            .filter((d) => typeof d.date === 'number' && !Number.isNaN(d.date))
            .sort((a, b) => a.date - b.date)
    }, [questionData, showPrediction, chartMode, selectedQuestions])

    // カスタムツールチップ
    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null
        const item = timeChartData.find((d) => d.date === label)
        if (!item) return null
        return (
            <div className="bg-white p-3 border rounded shadow">
                <p className="font-medium mb-1">
                    {item.isPrediction ? `${item.period} (予測)` : item.period}
                </p>
                {payload.map((entry, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
            <span>
              <span
                  className="inline-block w-2 h-2 mr-1 rounded-full"
                  style={{ backgroundColor: entry.color }}
              />
                {entry.name}: {parseFloat(entry.value).toFixed(2)}
            </span>
                        {item.isPrediction && <span className="text-blue-600 text-xs">(予測値)</span>}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="mt-6 px-6 pb-6">
            <h2 className="text-2xl font-bold mb-4">エンゲージメントサーベイ結果推移</h2>
            <div className="bg-white rounded-lg shadow p-4">
                {/* 操作エリア */}
                <div className="flex justify-between items-center mb-4">
                    {/* 予測切替 */}
                    <div className="flex items-center">
                        <label className="flex items-center cursor-pointer">
                            <span className="mr-2">予測値:</span>
                            <input
                                type="checkbox"
                                checked={showPrediction}
                                onChange={() => setShowPrediction((v) => !v)}
                                className="mr-1"
                            />
                        </label>
                        <div className="relative">
                            <button
                                onMouseEnter={() => setShowHelpTooltip(true)}
                                onMouseLeave={() => setShowHelpTooltip(false)}
                                className="ml-2 text-gray-500"
                            >
                                ?
                            </button>
                            {showHelpTooltip && (
                                <div className="absolute p-2 bg-white border rounded shadow text-xs">
                                    過去のデータトレンドに基づいた予測値を点線で表示します。
                                </div>
                            )}
                        </div>
                    </div>
                    {/* モード切替 */}
                    <div className="space-x-2">
                        {['満足値', '期待値', 'GAP'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setChartMode(mode)}
                                className={`px-3 py-1 rounded ${
                                    chartMode === mode
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-700'
                                }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
                {/* チャート */}
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timeChartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                type="number"
                                scale="time"
                                domain={['dataMin', 'dataMax']}
                                tickFormatter={(v) => {
                                    const d = new Date(v)
                                    return isNaN(d) ? '' : `${d.getFullYear()}-${formatMonth(d.getMonth() + 1)}`
                                }}
                            />
                            <YAxis
                                domain={chartMode === 'GAP' ? [-4, 4] : [0, 5]}
                                label={{
                                    value: chartMode === 'GAP' ? 'GAP値' : '評価',
                                    angle: -90,
                                    position: 'insideLeft',
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {chartMode === 'GAP' && <ReferenceLine y={0} stroke="#000" />}
                            {selectedQuestions.map((qId) => (
                                <Line
                                    key={qId}
                                    type="monotone"
                                    dataKey={getDataKey(qId)}
                                    name={`設問${qId}`}
                                    stroke={questionColors[qId]?.color}
                                    strokeWidth={2}
                                    dot={false}
                                    connectNulls
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                {/* 質問選択 */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {allQuestions.map((q) => (
                        <button
                            key={q.id}
                            onClick={() => toggleQuestionSelection(q.id)}
                            className={`p-2 text-xs rounded border ${
                                selectedQuestions.includes(q.id)
                                    ? 'bg-blue-100 border-blue-300'
                                    : 'bg-white border-gray-200'
                            }`}
                        >
                            {q.text}
                        </button>
                    ))}
                </div>
                {/* インサイト */}
                {insightTexts.length > 0 && (
                    <div className="mt-6 bg-gray-50 p-4 rounded">
                        <h3 className="font-bold mb-2">結果推移から見えるインサイト</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {insightTexts.map((ins, i) => (
                                <div key={i} className="bg-white p-3 rounded shadow-sm">
                                    <div className="flex items-center mb-1">
                                        <div dangerouslySetInnerHTML={{ __html: ins.icon }} />
                                        <h4 className="ml-2 font-medium">{ins.title}</h4>
                                    </div>
                                    <p className="text-sm">{ins.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* スコアテーブル */}
                <div className="mt-6">
                    <CategoryScoreTable
                        mergedData={scoreMode === 'engagement' ? engagementSurveyData : managerScoreData}
                        comparisonPeriod={comparisonPeriod}
                        setComparisonPeriod={setComparisonPeriod}
                    />
                </div>
            </div>
        </div>
    )
}

export default EngagementSurveyChart