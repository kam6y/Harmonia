import React from 'react';
import TooltipBubble from './TooltipBubble';

const NavigationButtons = ({
  onPrev,
  onNext,
  onGenerate,
  currentIndex,
  totalItems,
  isLoading,
  showTooltip, // 吹き出し表示フラグ
}) => (
  <>
    {/* 左側のナビゲーションボタン */}
    <button
      onClick={onPrev}
      disabled={currentIndex === 0}
      className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 w-12 h-12 rounded-full flex items-center justify-center z-20 ${
        currentIndex === 0
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-white shadow-md text-brand-cyan hover:bg-brand-lightGray'
      }`}
      aria-label="前の施策"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 18L9 12L15 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>

    {/* 右側のナビゲーションボタン */}
    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-6 z-20">
      {showTooltip && (
        <TooltipBubble text="AIの提案を閲覧する" />
      )}
      <button
        onClick={() => {
          if (currentIndex === totalItems - 1) {
            // 最後のカードで右にスライドしようとした場合、新しい施策を生成
            onGenerate();
          } else {
            // それ以外の場合は次の施策に移動
            onNext();
          }
        }}
        disabled={isLoading}
        className={`w-12 h-12 rounded-full flex items-center justify-center ${
          isLoading
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white shadow-md text-brand-cyan hover:bg-brand-lightGray'
        }`}
        aria-label="次の施策"
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-brand-cyan"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  </>
);

export default NavigationButtons;