import React, { forwardRef } from "react";

// 5段階の円の大きさを修正: 両端が大きく、中央に向かって小さくなる
const circleSizes = [
  "w-24 h-24", // 最左（大）
  "w-16 h-16", // 左から2番目（中）
  "w-12 h-12", // 中央（小）
  "w-16 h-16", // 右から2番目（中）
  "w-24 h-24", // 最右（大）
];

// 各円の上に表示するラベル
const circleLabels = [
  "満足している",
  "やや満足している",
  "どちらとも言えない",
  "やや満足していない",
  "満足していない"
];

// ラベルの色
const labelColors = [
  "text-brand-orange",
  "text-brand-orange",
  "text-brand-darkBlue", 
  "text-brand-teal",
  "text-brand-teal"
];

const RealQuestion = forwardRef(({ questionIndex, question, currentValue, onChange }, ref) => {
  // ラジオボタン群を生成
  const satisfactionButtons = circleSizes.map((size, i) => {
    const value = 5 - i; // 1~5
    const selected = currentValue === value;

    const selectedStyle = selected
      ? i < 2
        ? "border-brand-orange bg-brand-orange text-white" // 左側（賛成側）が選択された場合
        : i === 2
          ? "border-brand-darkBlue bg-brand-darkBlue text-white" // 中央が選択された場合
          : "border-brand-teal bg-brand-teal text-white" // 右側（反対側）が選択された場合
      : "border-gray-300 bg-white hover:border-gray-400";

    return (
      <div key={`sat-${question.id}-${value}`} className="flex flex-col items-center mx-6">
        {/* 各円の上に表示するラベル - すべて同じ高さに */}
        <div className={`${labelColors[i]} text-sm h-10 mb-4 text-center whitespace-nowrap font-bold`}>
          {circleLabels[i]}
        </div>
        
        {/* 円の位置を揃えるために、コンテナの高さを一定にする */}
        <div className="flex items-center justify-center" style={{ height: '80px' }}>
          <label className="relative">
            <input
              type="radio"
              name={`satisfaction-${question.id}`}
              value={value}
              checked={selected}
              onChange={() => onChange(questionIndex, value)}
              className="hidden"
            />
            <span
              className={`
                inline-flex items-center justify-center rounded-full 
                border-2 transition-all duration-200
                ${size}
                ${selectedStyle}
              `}
            >
              {selected && (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </span>
          </label>
        </div>
      </div>
    );
  });

  return (
    <div ref={ref} className="p-8 mb-6 bg-white rounded-3xl shadow-lg border border-brand-lightGray">
      {/* 質問ヘッダー - デザイン向上 */}
      <div className="mb-10">
        <h2 className="text-brand-darkBlue font-bold text-center text-lg leading-relaxed px-4">
          {question.question_text}
        </h2>
        <div className="w-80 h-1 bg-brand-teal mx-auto mt-6 rounded-full opacity-60"></div>
      </div>
    
      {/* 回答セクション */}
      <div className="mb-6">
        {/* 選択ボタン - 横幅を広げる */}
        <div className="flex justify-center items-end w-full max-w-3xl mx-auto">
          {satisfactionButtons}
        </div>
      </div>
    </div>
  );
});

export default RealQuestion;