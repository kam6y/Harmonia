// /src/manager/StepBar.jsx
import React from 'react';

/**
 * ステップナビゲーションを表示するコンポーネント
 * @param {Object} props
 * @param {number} props.currentStep - 現在のステップ番号
 * @param {Array} props.steps - ステップ情報の配列 [{id: number, label: string}]
 */
const StepBar = ({ currentStep, steps = [] }) => {
  return (
    <div className="flex w-screen justify-center items-center mb-6 p-2 bg-white rounded -m-4">
      {steps.map((step, idx) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        const isLast = idx === steps.length - 1;
        let circleBg = 'bg-brand-lightGray text-gray-500';
        
        if (isCompleted) {
          circleBg = 'bg-brand-teal text-white';
        } else if (isActive) {
          circleBg = 'bg-brand-cyan text-white';
        }
        
        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${circleBg}`}
            >
              {step.id}
            </div>
            <div className="ml-2 mr-4 text-sm font-medium text-brand-darkBlue">
              {step.label}
            </div>
            {!isLast && (
              <div
                className={`h-1 w-10 ${
                  isCompleted ? 'bg-brand-teal' : 'bg-brand-lightGray'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepBar;