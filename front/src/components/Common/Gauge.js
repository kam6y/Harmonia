import React from "react";

const Gauge = ({ value, max = 100, color = "brand-cyan" }) => {
  const percentage = (value / max) * 100;
  const angle = (value * 180) / max; // スコアに応じた角度 (0° ~ 180°)
  const radius = 40; // 円の半径
  const circumference = Math.PI * radius; // 半円の円周長 (πr)
  const dashArray = (circumference * angle) / 180; // 塗りつぶす部分
  const dashOffset = circumference - dashArray; // 残りの部分

  return (
    <div className="relative w-40 h-20">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        {/* 背景ゲージ */}
        <path
          d="M10,50 A40,40 0 0,1 90,50"
          fill="none"
          stroke="currentColor"
          className="text-gray-300" // 背景ゲージの色
          strokeWidth="8"
        />
        {/* スコアゲージ */}
        <path
          d="M10,50 A40,40 0 0,1 90,50"
          fill="none"
          stroke="currentColor"
          className={`text-${color}`} // Tailwindのブランドカラーを適用
          strokeWidth="8"
          strokeDasharray={`${(circumference * percentage) / 100} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default Gauge;