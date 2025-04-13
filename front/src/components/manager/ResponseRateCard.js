import React from "react";

const ResponseRateCard = ({ responseRates }) => {
  // props で受け取ったデータが存在しない場合は、フォールバック用のダミーデータを利用
  const data = responseRates || [
    { label: "全社", rate: 70 },
    { label: "営業部営業課", rate: 40 },
    { label: "組織B", rate: 60 },
    { label: "組織C", rate: 50 },
  ];

  return (
    <div className="w-full">
      {/* タイトル（高さを揃える） */}
      <h2 className="text-xl font-bold mb-2 flex items-center text-gray-900">部署別回答率</h2>

      {/* 回答率カード - 縦幅を小さくする */}
      <div className="bg-white shadow-md rounded-lg p-4 relative min-h-[180px] flex flex-col">
        {/* ヘッダー */}
        <div className="grid grid-cols-4 text-gray-600 font-medium border-b pb-1">
          {data.map((item, index) => (
            <div key={index} className="text-center">{item.label}</div>
          ))}
        </div>

        {/* 回答率データ - 上下のパディングを小さくする */}
        <div className="grid-cols-4 grid text-black text-2xl font-bold flex-grow items-center mt-2">
          {data.map((item, index) => (
            <div
              key={index}
              className={`text-center py-3 rounded-md flex items-center justify-center ${
                item.rate < 50 ? "bg-red-200 text-gray-800" : ""
              }`}
            >
              {item.rate}%
            </div>
          ))}
        </div>

        {/* 注意書き - 上のマージンを小さくする */}
        <p className="text-sm text-red-400 mt-3">
          ※信頼度の不足した部門の回答を含みます。
        </p>
      </div>
    </div>
  );
};

export default ResponseRateCard;