import React from 'react';

const ChallengeInfoDisplay = ({
  selectedCategory,
  selectedKadai,
  currentSatisfaction,
  currentExpectation,
  currentGap,
  computedTargetSatisfaction,
  computedTargetExpectation,
  computedTargetGap,
}) => (
  <div className="mb-2 bg-brand-lightGray p-4 rounded">
    <span className="text-xs font-semibold bg-brand-teal text-white px-2 py-1 rounded-full">
      カテゴリー
    </span>
    <div className="flex justify-between">
      <div>
        <div className="mb-3">
          <p className="text-lg font-semibold mt-1">{selectedCategory}</p>
        </div>
        <div>
          <span className="text-xs font-semibold bg-brand-orange text-white px-2 py-1 rounded-full">
            選択した課題
          </span>
          <ul className="list-disc list-inside ml-4 mt-1">
            {selectedKadai.map((item) => (
              <li key={item.id}>{item.challenge}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex gap-8">
        <div className="text-center">
          <p className="text-md text-gray-600">満足度</p>
          <p className="text-2xl font-bold text-brand-darkBlue">
            {currentSatisfaction.toFixed(1)}{' '}
            <span className="text-brand-orange">&#9733;</span>
          </p>
          <p className="text-sm text-gray-600 mt-4 mb-1">目標満足度</p>
          <p className="text-xl font-bold text-brand-darkBlue">
            {computedTargetSatisfaction.toFixed(1)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-md text-gray-600">期待値</p>
          <p className="text-2xl font-bold text-brand-darkBlue">
            {currentExpectation.toFixed(1)}{' '}
            <span className="text-brand-orange">&#9733;</span>
          </p>
          <p className="text-sm text-gray-600 mt-4 mb-1">目標期待値</p>
          <p className="text-xl font-bold text-brand-darkBlue">
            {computedTargetExpectation.toFixed(1)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-md text-gray-600">GAP</p>
          <p className="text-2xl font-bold text-brand-darkBlue">
            {currentGap.toFixed(1)}
          </p>
          <p className="text-sm text-gray-600 mt-4 mb-1">目標GAP</p>
          <p className="text-xl font-bold text-brand-darkBlue">
            {computedTargetGap.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default ChallengeInfoDisplay;