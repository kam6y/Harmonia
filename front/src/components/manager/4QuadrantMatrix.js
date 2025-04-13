// front/src/components/manager/4QuadrantMatrix.js
import React, { useMemo } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
  ReferenceArea,
  LabelList,
} from 'recharts'

// ブランドカラー定義
const brandColors = {
  darkBlue: '#004259',
  teal: '#178394',
  cyan: '#00A3B3',
  orange: '#F29759',
  coral: '#FC7F7A',
  lightGray: '#F1F4F5',

  // 半透明バージョン（象限用）
  iceBlock: 'rgba(0, 163, 179, 0.3)', // Cyan - 課題
  interLink: 'rgba(252, 127, 122, 0.3)', // Coral - 強み
  lowPriority: 'rgba(55, 65, 81, 0.3)', // Dark Gray - 優先度低
  coreStrategy: 'rgba(242, 151, 89, 0.3)', // Orange - 隠れた強み
}

// 象限のラベル情報
const quadrantLabels = [
  { name: '課題', x1: 1, x2: 3, y1: 3, y2: 5, fill: brandColors.iceBlock },
  { name: '強み', x1: 3, x2: 5, y1: 3, y2: 5, fill: brandColors.interLink },
  {
    name: '優先度低',
    x1: 1,
    x2: 3,
    y1: 1,
    y2: 3,
    fill: brandColors.lowPriority,
  },
  {
    name: '隠れた強み',
    x1: 3,
    x2: 5,
    y1: 1,
    y2: 3,
    fill: brandColors.coreStrategy,
  },
]

// カスタムラベルコンポーネント
const CustomizedLabel = (props) => {
  const { x, y, value } = props

  if (!value) return null

  // ラベルを短縮する関数
  const truncateLabel = (label) => {
    return label.length > 8 ? `${label.substring(0, 7)}...` : label
  }

  return (
    <g>
      <text
        x={x}
        y={y - 15}
        textAnchor="middle"
        fill={brandColors.darkBlue}
        fontSize={11}
        fontWeight="600"
        dominantBaseline="middle"
        style={{
          textShadow:
            '0 0 5px white, 0 0 5px white, 0 0 5px white, 0 0 5px white',
          pointerEvents: 'none',
        }}
      >
        {truncateLabel(value)}
      </text>
    </g>
  )
}

// カスタムツールチップコンポーネント
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  const gap = (data.y - data.x).toFixed(1)
  const gapType = parseFloat(gap) > 0 ? 'negative' : 'positive'

  return (
    <div className="bg-white p-3 border border-brand-teal rounded-md shadow-lg max-w-xs">
      <p className="font-bold text-brand-darkBlue mb-2 text-sm border-b pb-1">
        {data.category}
      </p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <p className="text-brand-teal">
          実感: <span className="font-medium">{data.x.toFixed(1)}</span>
        </p>
        <p className="text-brand-teal">
          期待: <span className="font-medium">{data.y.toFixed(1)}</span>
        </p>
      </div>
      <p
        className={`text-xs mt-2 font-bold ${parseFloat(gap) > 0 ? 'text-red-500' : parseFloat(gap) < 0 ? 'text-green-500' : 'text-gray-500'}`}
      >
        ギャップ: {gap}{' '}
        {parseFloat(gap) > 0 ? '↓' : parseFloat(gap) < 0 ? '↑' : '-'}
      </p>
    </div>
  )
}

/**
 * 4象限マトリクスコンポーネント
 * @param {string} selectedDept - 選択された部署
 * @param {function} setSelectedDept - 部署選択を更新する関数
 * @param {string} selectedSurveyDate - 選択されたサーベイ日付
 * @param {function} setSelectedSurveyDate - サーベイ日付を更新する関数
 * @param {Array} allSurveyDates - 全サーベイ日付リスト
 * @param {Object} departmentData - 部署ごとのデータ
 * @param {boolean} showSurveyDateSelector - サーベイ日付セレクターを表示するか
 * @param {boolean} showDepartmentSelector - 部署セレクターを表示するか
 * @param {boolean} isIssueView - issue.jsxでの表示かどうか
 */
const QuadrantMatrix = ({
  selectedDept = '',
  setSelectedDept = () => {},
  selectedSurveyDate = '',
  setSelectedSurveyDate = () => {},
  allSurveyDates = [],
  departmentData = {},
  showSurveyDateSelector = true,
  showDepartmentSelector = true,
  isIssueView = false,
}) => {
  // メモ化して再レンダリングを防止
  const deptData = useMemo(() => {
    // departmentDataが存在し、selectedDeptが有効な値の場合にデータを返す
    if (
      departmentData &&
      selectedDept &&
      departmentData[selectedDept] &&
      Array.isArray(departmentData[selectedDept])
    ) {
      return departmentData[selectedDept]
    }
    return []
  }, [departmentData, selectedDept])

  // 有効な部署リストを取得（メモ化）
  const validDepartments = useMemo(() => {
    return departmentData
      ? Object.keys(departmentData).filter(
          (dept) =>
            departmentData[dept] &&
            Array.isArray(departmentData[dept]) &&
            departmentData[dept].length > 0
        )
      : []
  }, [departmentData])

  // データの最小値と最大値を計算（メモ化）
  const { minX, maxX, minY, maxY } = useMemo(() => {
    if (!deptData || deptData.length === 0) {
      return { minX: 1, maxX: 5, minY: 1, maxY: 5 } // デフォルト値
    }

    const xValues = deptData.map((d) => d.x)
    const yValues = deptData.map((d) => d.y)

    return {
      minX: Math.floor(Math.min(...xValues)) || 1,
      maxX: Math.ceil(Math.max(...xValues)) || 5,
      minY: Math.floor(Math.min(...yValues)) || 1,
      maxY: Math.ceil(Math.max(...yValues)) || 5,
    }
  }, [deptData])

  // サーベイ日付タブの表示
  const renderSurveyDateTabs = () => {
    if (
      !showSurveyDateSelector ||
      !allSurveyDates ||
      allSurveyDates.length === 0
    )
      return null

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {allSurveyDates.map((date) => (
          <button
            key={date}
            onClick={() => setSelectedSurveyDate(date)}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
              selectedSurveyDate === date
                ? isIssueView
                  ? 'bg-brand-coral text-white shadow-md'
                  : 'bg-brand-darkBlue text-white shadow-md'
                : isIssueView
                  ? 'bg-brand-orange text-white hover:bg-brand-coral'
                  : 'bg-brand-cyan text-white hover:bg-brand-teal'
            }`}
            aria-label={`サーベイ日付を${date}に設定`}
          >
            {date}
          </button>
        ))}
      </div>
    )
  }

  // 部署タブの表示
  const renderDepartmentTabs = () => {
    if (!showDepartmentSelector || validDepartments.length === 0) return null

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {validDepartments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
              selectedDept === dept
                ? 'bg-brand-darkBlue text-white shadow-md'
                : 'bg-brand-cyan text-white hover:bg-brand-teal'
            }`}
            aria-label={`${dept}を選択`}
          >
            {dept}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* サーベイ日時選択タブをタイトルの前に配置 */}
      {isIssueView && renderSurveyDateTabs()}

      {/* 部署選択タブ表示 */}
      {renderDepartmentTabs()}

      {/* 通常の日付選択タブ（issue.jsx以外での使用時） */}
      {!isIssueView && renderSurveyDateTabs()}

      {/* データがない場合のメッセージ */}
      {deptData.length === 0 && (
        <div className="w-full py-16 bg-white rounded-xl shadow text-center">
          <p className="text-gray-500">
            データがありません。別の部署または日付を選択してください。
          </p>
        </div>
      )}

      {/* マトリクス本体 - データがある場合のみ表示 */}
      {deptData.length > 0 && (
        <div className="w-full aspect-square bg-white rounded-xl shadow p-4">
          <ResponsiveContainer
            width="100%"
            height="100%"
            className="overflow-visible"
          >
            <ScatterChart margin={{ top: 40, right: 50, bottom: 40, left: 40 }}>
              {/* 4象限の背景色と名前 */}
              {quadrantLabels.map((quadrant, index) => (
                <ReferenceArea
                  key={`quadrant-${index}`}
                  x1={quadrant.x1}
                  x2={quadrant.x2}
                  y1={quadrant.y1}
                  y2={quadrant.y2}
                  fill={quadrant.fill}
                  ifOverflow="hidden"
                  label={{
                    value: quadrant.name,
                    position: 'center',
                    fill: brandColors.darkBlue,
                    fontSize: 14,
                    fontWeight: 'bold',
                  }}
                />
              ))}

              {/* X・Y 軸の基準線（中央） */}
              <ReferenceLine x={3} stroke="#666" strokeWidth={1} />
              <ReferenceLine y={3} stroke="#666" strokeWidth={1} />

              {/* y = x の直線 */}
              <ReferenceLine
                segment={[
                  { x: 1, y: 1 },
                  { x: 5, y: 5 },
                ]}
                stroke="#666"
                strokeDasharray="5 5"
              />

              <XAxis
                type="number"
                dataKey="x"
                domain={[1, 5]}
                tickCount={5}
                allowDataOverflow={false}
                stroke={brandColors.darkBlue}
              >
                <Label
                  value="実感"
                  position="insideBottom"
                  offset={-15}
                  fill={brandColors.darkBlue}
                  style={{ fontWeight: 'bold', fontSize: 14 }}
                />
              </XAxis>
              <YAxis
                type="number"
                dataKey="y"
                domain={[1, 5]}
                tickCount={5}
                allowDataOverflow={false}
                stroke={brandColors.darkBlue}
              >
                <Label
                  value="期待"
                  position="insideLeft"
                  angle={-90}
                  offset={-15}
                  fill={brandColors.darkBlue}
                  style={{ fontWeight: 'bold', fontSize: 14 }}
                />
              </YAxis>

              {/* ツールチップ */}
              <Tooltip content={<CustomTooltip />} />

              {/* データポイント */}
              <Scatter
                name={selectedDept || ''}
                data={deptData}
                fill={brandColors.darkBlue}
                stroke="#fff"
                strokeWidth={1}
                isAnimationActive={true}
              >
                <LabelList
                  dataKey="category"
                  position="top"
                  content={<CustomizedLabel />}
                />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default QuadrantMatrix