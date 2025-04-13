// src/components/manager/measures/Step3Content.jsx
import React, { useEffect, useState } from 'react'
import ChallengeInfoDisplay from './ChallengeInfoDisplay'
import StepNavigation from './StepNavigation'
import TooltipBubble from './TooltipBubbleAI2'

const Step3Content = ({
  selectedCategory,
  selectedKadai,
  currentSatisfaction,
  currentExpectation,
  currentGap,
  computedTargetSatisfaction,
  computedTargetExpectation,
  computedTargetGap,
  measures,
  lastViewedMeasureIndex,
  satisfactionOffset,
  gapOffset,
  setSatisfactionOffset,
  setGapOffset,
  handlePrev,
  handleFinish,
  canGoNext,
  aiRecommended = false, // 新しいプロパティ：AIによる推奨値かどうか
}) => {
  // 吹き出しの表示を管理する状態
  const [showTooltip, setShowTooltip] = useState(aiRecommended)

  // 吹き出しを一定時間後に非表示にする
  useEffect(() => {
    if (aiRecommended) {
      const timer = setTimeout(() => {
        setShowTooltip(false)
      }, 30000) // 30秒後に吹き出しを非表示

      return () => clearTimeout(timer)
    }
  }, [aiRecommended])

  return (
    <div className="p-2">
      <h2 className="text-3xl font-bold text-brand-teal mb-4">
        施策に対する目標を設定しましょう
      </h2>

      {/* 課題情報表示 */}
      <ChallengeInfoDisplay
        selectedCategory={selectedCategory}
        selectedKadai={selectedKadai}
        currentSatisfaction={currentSatisfaction}
        currentExpectation={currentExpectation}
        currentGap={currentGap}
        computedTargetSatisfaction={computedTargetSatisfaction}
        computedTargetExpectation={computedTargetExpectation}
        computedTargetGap={computedTargetGap}
      />

      <hr className="my-8 h-px border-0 bg-gray-300" />

      <div className="mb-6 bg-brand-lightGray p-4 rounded">
        <p className="text-sm font-medium mb-1">選択中の施策</p>
        <div className="bg-white rounded-lg shadow-md p-6 mt-2">
          <div className="flex">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  施策案
                </label>
                <p className="font-semibold">
                  {measures[lastViewedMeasureIndex].shisaku}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  アクションプラン
                </label>
                <p className="font-semibold">
                  {measures[lastViewedMeasureIndex].actionPlan}
                </p>
              </div>
            </div>

            {/* 入力欄部分 */}
            <div className="flex w-1/2 justify-between px-8 py-2 ml-auto mb-4 bg-brand-teal rounded relative">
              {/* AIによる推奨値であれば吹き出しを表示 */}
              {showTooltip && (
                <TooltipBubble
                  text="過去の事例を参考にAIがこの施策で予想される目標値を設定しました。必要に応じて調整してください。"
                  onClose={() => setShowTooltip(false)}
                />
              )}
              {/* 目標満足度 */}
              <div>
                <label className="block text-center text-white text-md font-bold mb-1">
                  目標満足度
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xl text-gray-500">
                    +
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={(5 - currentSatisfaction).toFixed(1)}
                    className="w-32 h-16 pl-6 border text-2xl border-brand-darkBlue rounded px-2 py-1"
                    value={satisfactionOffset}
                    onChange={(e) => {
                      let value = parseFloat(e.target.value)
                      if (isNaN(value)) value = 0
                      // 目標満足度 = currentSatisfaction + satisfactionOffset <= 5 となるようにクランプ
                      const maxOffset = 5 - currentSatisfaction
                      if (value < 0) value = 0
                      if (value > maxOffset) value = maxOffset
                      setSatisfactionOffset(value)
                    }}
                    placeholder="1.0"
                  />
                </div>
              </div>

              {/* 目標GAP */}
              <div>
                <label className="block text-center text-white text-md font-bold mb-1">
                  目標GAP
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xl text-gray-500">
                    -
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={
                      5 - currentExpectation - satisfactionOffset < 0
                        ? (-(
                            5 -
                            currentExpectation -
                            satisfactionOffset
                          )).toFixed(1)
                        : '5'
                    }
                    className="w-32 h-16 pl-6 border text-2xl border-brand-darkBlue rounded px-2 py-1"
                    value={Math.abs(gapOffset)}
                    onChange={(e) => {
                      let value = parseFloat(e.target.value)
                      if (isNaN(value)) value = 0
                      if (value < 0) value = 0
                      if (value > 5) value = 5
                      // 目標期待値 = currentExpectation + satisfactionOffset + (-value) <= 5 となるように制御
                      const allowedMaxGap =
                        5 - currentExpectation - satisfactionOffset
                      // allowedMaxGap が負の場合、その絶対値が最大許容値
                      if (allowedMaxGap < 0) {
                        const maxAbs = -allowedMaxGap
                        if (value > maxAbs) value = maxAbs
                      }
                      setGapOffset(-value)
                    }}
                    placeholder="0.2"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                担当者
              </label>
              <p className="font-semibold">
                {measures[lastViewedMeasureIndex].assignee}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                期限
              </label>
              <p className="font-semibold">
                {measures[lastViewedMeasureIndex].dueDate}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              アクションプラン詳細
            </label>
            <p className="text-sm">
              {measures[lastViewedMeasureIndex].actionPlanDetail}
            </p>
          </div>
        </div>
      </div>

      <StepNavigation
        onPrev={handlePrev}
        onFinish={handleFinish}
        canGoNext={canGoNext}
        isLastStep={true}
      />
    </div>
  )
}

export default Step3Content
