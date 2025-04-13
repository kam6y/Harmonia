// front/src/components/common/QuestionnaireScore.js
import ScoreCard from '../common/ScoreCard'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts'
import Gauge from '../common/Gauge'

const QuestionnaireScore = ({
  score = 0,
  prevDiff = 0,
  companyAvg = '0',
  rating = 0,
  ratingLabel = '-',
  history = [],
  setSelectedYears = () => {},
  selectedYears = 1,
}) => {
  const yearDataPoints = { 1: 3, 3: 7, 5: 11 }

  // historyが存在するか確認し、安全にアクセス
  const safeHistory = Array.isArray(history) ? history : []
  
  const filteredHistory =
    safeHistory.length >= yearDataPoints[selectedYears]
      ? safeHistory.slice(-yearDataPoints[selectedYears])
      : safeHistory

  // 空の配列の場合のフォールバックを追加
  const scores = filteredHistory.length > 0 
    ? filteredHistory.map((item) => item.score)
    : [0]
    
  const minScore = scores.length ? Math.min(...scores) : 0
  const maxScore = scores.length ? Math.max(...scores) : 100

  const margin = (maxScore - minScore) * 0.1
  const yAxisMin = Math.max(0, Math.floor((minScore - margin) / 10) * 10)
  const yAxisMax = Math.min(100, Math.ceil((maxScore + margin) / 10) * 10)

  // スコアと偏差値の整合性チェック
  const validateRatingData = () => {
    // 全社平均値を数値として抽出（例："66 (+2)" から 66 を取得）
    const companyAvgValue = parseFloat(companyAvg?.split(' ')[0] || 0);
    
    // 矛盾検出: スコアが全社平均より高いのに偏差値が50未満の場合
    if (score > companyAvgValue && rating < 50) {
      console.warn('データ不整合を検出: スコア > 全社平均 なのに 偏差値 < 50');
      
      // スコアと全社平均の差に基づいて偏差値を修正計算
      const scoreDiff = score - companyAvgValue;
      const correctedRating = 50 + (scoreDiff / companyAvgValue) * 10;
      
      // 修正した偏差値に対する適切なラベルを決定
      const correctedLabel = getRatingLabelFromDeviation(correctedRating);
      
      return {
        rating: Math.round(correctedRating * 10) / 10, // 小数点第一位まで
        label: correctedLabel
      };
    }
    
    // 不整合がなければ既存値を返す
    return {
      rating: rating,
      label: ratingLabel
    };
  }
  
  // 偏差値からラベルを決定（BackendコントローラのconvertRatingToLabelに対応）
  const getRatingLabelFromDeviation = (deviation) => {
    if (deviation >= 65) return 'S';
    if (deviation >= 60) return 'A+';
    if (deviation >= 55) return 'A';
    if (deviation >= 52.5) return 'A-';
    if (deviation >= 50) return 'B+';
    if (deviation >= 47.5) return 'B';
    if (deviation >= 45) return 'B-';
    if (deviation >= 42.5) return 'C+';
    if (deviation >= 40) return 'C';
    if (deviation >= 37.5) return 'C-';
    if (deviation >= 35) return 'D+';
    return 'D';
  }

  // 前回比の記号とスタイルを決定する関数
  const getPrevDiffFormatted = (diff) => {
    if (!diff && diff !== 0) return 'データなし';
    
    const sign = diff > 0 ? '+' : '';
    const colorClass = diff > 0 
      ? 'text-green-500' 
      : (diff < 0 ? 'text-red-500' : 'text-gray-600');
    
    return <span className={`font-bold ${colorClass}`}>{sign}{diff}</span>;
  }

  // チャート用にhistoryデータを拡張
  const enhancedHistory = filteredHistory.map((item, idx) => {
    const date = item.date ? new Date(item.date) : null;
    const formattedDate = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : `期間${idx+1}`;
    
    return {
      ...item,
      formattedDate,
      // グラデーション用に前の値との中間点を作成
      paddedScore: item.score
    };
  });

  // データ検証と修正
  const validatedRating = validateRatingData();

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow text-xs">
          <p className="font-bold">{data.formattedDate || label}</p>
          <p>スコア: <span className="font-semibold text-brand-cyan">{data.score}</span></p>
          <p>評価: <span className="font-semibold text-orange-500">{data.rating || '-'}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col w-[97%] mx-auto">
      <div className="flex justify-center space-x-6">
        {/* スコア */}
        <div className="w-1/4">
          {/* タイトル */}
          <div className="flex items-center justify-center mb-2">
            <p className="text-lg font-bold text-black text-center">スコア</p>
            <div className="relative group ml-1">
              <svg className="w-4 h-4 text-brand-cyan cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg p-2 z-10 hidden group-hover:block text-xs text-gray-700 border border-gray-200">
                アンケートの回答から算出された絶対評価指標（0〜100）です。数値が高いほど良好です。
              </div>
            </div>
          </div>

          {/* スコアカード */}
          <ScoreCard className="flex flex-col justify-center items-center h-64 p-6">
            {/* ゲージとスコア */}
            <div className="relative w-40 h-20 flex justify-center items-center">
              <Gauge value={score} max={100} />
              <p className="absolute text-5xl font-bold text-black mt-10">
                {score}
              </p>
            </div>

            {/* 仕切り線 */}
            <div className="border-t border-gray-300 w-full my-4"></div>

            {/* 前回比・全社平均 */}
            <div className="text-sm text-gray-500 flex flex-col items-center gap-2">
              <p>
                前回比 {getPrevDiffFormatted(prevDiff)}
              </p>
              <p>全社平均 {companyAvg}</p>
            </div>
          </ScoreCard>
        </div>

        {/* レーティング */}
        <div className="w-1/4">
          {/* タイトル */}
          <div className="flex items-center justify-center mb-2">
            <p className="text-lg font-bold text-black text-center">レーティング</p>
            <div className="relative group ml-1">
              <svg className="w-4 h-4 text-brand-cyan cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="absolute left-0 mt-1 w-64 bg-white rounded-lg shadow-lg p-2 z-10 hidden group-hover:block text-xs text-gray-700 border border-gray-200">
                <p className="mb-1"><span className="font-semibold">偏差値</span>として表示され、社内全部署との相対比較を示します。</p>
                <p className="mb-1">- <span className="font-semibold">50</span>：社内平均</p>
                <p className="mb-1">- <span className="font-semibold">60以上</span>：上位約16%</p>
                <p>- <span className="font-semibold">40以下</span>：下位約16%</p>
              </div>
            </div>
          </div>

          {/* レーティングカード */}
          <ScoreCard className="flex flex-col justify-center items-center h-64 p-6">
            {/* レーティング数値 - 検証済み値を使用 */}
            <p className="text-7xl font-bold text-black">{validatedRating.rating}</p>

            {/* レーティングラベル - 検証済み値を使用 */}
            <p className="text-3xl text-orange-500 font-bold mt-4">
              {validatedRating.label}
            </p>
            
            {/* レーティング説明 */}
            <div className="mt-4 text-xs text-center text-gray-600">
              <p>社内偏差値（50が平均）</p>
            </div>
          </ScoreCard>
        </div>

        {/* スコア推移 - モダンデザインに改良 */}
        <div className="w-3/4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <p className="text-lg font-bold text-black">スコア推移</p>
              <div className="relative group ml-1">
                <svg className="w-4 h-4 text-brand-cyan cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg p-2 z-10 hidden group-hover:block text-xs text-gray-700 border border-gray-200">
                  経時的な変化を確認できます。低下傾向にあるカテゴリーは早期の対策が必要です。
                </div>
              </div>
            </div>
            {/* 期間切り替えボタン */}
            <div className="flex space-x-2">
              {[1, 3, 5].map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYears(year)}
                  className={`px-4 py-1 rounded-md text-white transition-all ${
                    selectedYears === year
                      ? 'bg-brand-darkBlue shadow-md'
                      : 'bg-brand-cyan hover:bg-brand-teal'
                  }`}
                >
                  {year}年
                </button>
              ))}
            </div>
          </div>
          <ScoreCard className="p-4 h-64 flex flex-col justify-center items-center">
            {/* スコア推移グラフ - モダンデザイン */}
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={enhancedHistory}
                margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7F50" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#FF7F50" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="formattedDate"
                  allowDuplicatedCategory={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  domain={[yAxisMin, yAxisMax]}
                  ticks={Array.from(
                    { length: (yAxisMax - yAxisMin) / 5 + 1 },
                    (_, i) => yAxisMin + i * 5
                  )}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={parseFloat(companyAvg?.split(' ')[0] || 0)} 
                  stroke="#00A3B3" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: '全社平均', 
                    position: 'left', 
                    fill: '#00A3B3',
                    fontSize: 11
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#FF7F50" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                  activeDot={{ r: 6, fill: '#FF7F50', stroke: '#FFF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ScoreCard>
        </div>
      </div>
    </div>
  )
}

export default QuestionnaireScore