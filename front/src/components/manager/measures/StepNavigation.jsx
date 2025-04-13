import React from 'react';

const StepNavigation = ({ onPrev, onNext, onFinish, canGoNext, isLastStep }) => (
  <div className="flex justify-between mt-8">
    <button
      onClick={onPrev}
      className="px-6 py-2 rounded border border-brand-darkBlue text-brand-darkBlue font-semibold hover:bg-brand-lightGray transition-colors"
    >
      戻る
    </button>
    <button
      onClick={isLastStep ? onFinish : onNext}
      disabled={!canGoNext}
      className={`px-6 py-2 rounded text-white font-semibold transition-colors ${
        canGoNext
          ? 'bg-brand-orange hover:bg-brand-coral'
          : 'bg-gray-300 cursor-not-allowed'
      }`}
    >
      {isLastStep ? '完了' : '次へ'}
    </button>
  </div>
);

export default StepNavigation;