// front/src/components/manager/measures/Step2Content.jsx
import React from 'react';
import ChallengeInfoDisplay from './ChallengeInfoDisplay';
import MeasureCard from './MeasureCard';
import NavigationButtons from './NavigationButtons';
import StepNavigation from './StepNavigation';

const Step2Content = ({
  selectedCategory,
  selectedKadai,
  currentSatisfaction,
  currentExpectation,
  currentGap,
  computedTargetSatisfaction,
  computedTargetExpectation, 
  computedTargetGap,
  currentMeasure,
  currentMeasureIndex,
  measures,
  updateMeasure,
  setShowAssigneeModal,
  assigneeList,
  handlePrevMeasure,
  handleNextMeasure,
  handleGenerateNewMeasure,
  isLoading,
  slideDirection,
  handlePrev,
  handleNext,
  canGoNext,
  isFirstVisit, // 新しいprops（初回訪問フラグ）
  isAIGenerated, // 新しいprops（AI生成フラグ）
}) => (
  <div className="p-2">
    <h2 className="text-3xl font-bold text-brand-teal mb-4">
      課題解決のための施策とアクションプランを設定
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

    {/* 施策カード */}
    <div className="mb-6 relative">
      <hr className="my-8 h-px border-0 bg-gray-300" />

      {/* ナビゲーションボタン */}
      <NavigationButtons
        onPrev={handlePrevMeasure}
        onNext={handleNextMeasure}
        onGenerate={handleGenerateNewMeasure}
        currentIndex={currentMeasureIndex}
        totalItems={measures.length}
        isLoading={isLoading}
        showTooltip={isFirstVisit && currentMeasureIndex === 0} // 初回訪問時かつ最初の施策でのみ表示
      />

      {/* 施策カード */}
      <MeasureCard
        currentMeasure={currentMeasure}
        currentMeasureIndex={currentMeasureIndex}
        totalMeasures={measures.length}
        updateMeasure={updateMeasure}
        setShowAssigneeModal={setShowAssigneeModal}
        assigneeList={assigneeList}
        slideDirection={slideDirection}
        isAIGenerated={isAIGenerated} // AI生成フラグを渡す
      />
    </div>

    {/* ステップナビゲーションボタン */}
    <StepNavigation
      onPrev={handlePrev}
      onNext={handleNext}
      canGoNext={canGoNext}
      isLastStep={false}
    />
  </div>
);

export default Step2Content;