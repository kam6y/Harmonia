import React from 'react'

/**
 * 速報スコアを表示するカードコンポーネント
 * 
 * @param {Object} props
 * @param {number} props.score - 現在のスコア値
 * @param {string} props.ratingLabel - スコアのレーティングラベル (例: "BB", "A")
 * @param {number} props.responseRate - 現在の回答率
 */
const SpeedScoreCard = ({ score, ratingLabel, responseRate }) => {
  return (
    <div className="bg-white rounded text-black">
      <h3 className="font-bold text-lg">速報スコア</h3>
      <div className="flex flex-col mt-4 items-center justify-center">
        <div className="text-7xl font-bold text-center mb-2 mt-4">
          {score || '–'}
        </div>
        <div className="text-sm mt-8 text-gray-500 text-center">
          回答率{responseRate}%時点の暫定スコア
        </div>
      </div>
    </div>
  )
}

export default SpeedScoreCard