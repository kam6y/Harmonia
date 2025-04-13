import React from 'react'

const QuadrantMatrixDetails = ({ selectedDept, departmentData }) => {
  // 選択された部署のデータを取得
  const deptData = departmentData?.[selectedDept] || {
    strong: ['データなし'],
    weak: ['データなし'],
    companyAvg: 0,
    departmentAvg: 0,
    summary: '詳細データがありません。'
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* 4象限マトリクスの見方 */}
      <h3 className="text-lg font-bold text-brand-darkBlue mb-2">
        4象限マトリクスの見方
      </h3>
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
          {/* 課題（左上） */}
          <div className="bg-brand-cyan bg-opacity-20 p-4 rounded-lg">
            <h4 className="font-bold text-brand-darkBlue">課題</h4>
            <p className="text-sm">
              期待は高いが実感が低い。重点的に改善すべき領域。
            </p>
          </div>

          {/* 強み（右上） */}
          <div className="bg-brand-coral bg-opacity-20 p-4 rounded-lg">
            <h4 className="font-bold text-brand-darkBlue">強み</h4>
            <p className="text-sm">期待も実感も高い。維持すべき良好な施策や環境要因がわかる可能性がある領域。</p>
          </div>

          {/* 優先度低（左下） */}
          <div className="bg-gray-600 bg-opacity-20 p-4 rounded-lg">
            <h4 className="font-bold text-brand-darkBlue">優先度低</h4>
            <p className="text-sm">
              期待も実感も低い。リソースを割く優先度が低い領域。限られたリソースをどこに集中させるべきかの判断材料になる可能性がある領域。
            </p>
          </div>

          {/* 隠れた強み（右下） */}
          <div className="bg-brand-orange bg-opacity-20 p-4 rounded-lg">
            <h4 className="font-bold text-brand-darkBlue">隠れた強み</h4>
            <p className="text-sm">
              期待は低いが実感は高い。積極的にアピールできるが、過剰投資をしている可能性がある領域。
            </p>
          </div>
        </div>
      </div>

      {/* 部署サマリーの見出し - 白い背景の外に配置 */}
      <h3 className="text-lg font-bold text-brand-darkBlue mb-2">
        {selectedDept} サマリー
      </h3>

      {/* 下部コンテンツを背景色のあるカードで囲む */}
      <div className="bg-white rounded-lg shadow p-6 w-full">
        {/* 部署の概要説明 */}
        {deptData?.summary && (
          <div className="mb-6">
            <p className="text-gray-700">{deptData.summary}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div>
            <h4 className="font-bold text-brand-teal text-lg mb-3">強み</h4>
            <ul className="list-disc pl-5 space-y-2">
              {deptData?.strong?.map((strength, idx) => (
                <li key={`strength-${idx}`} className="text-gray-700">
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-brand-coral text-lg mb-3">課題</h4>
            <ul className="list-disc pl-5 space-y-2">
              {deptData?.weak?.map((weakness, idx) => (
                <li key={`weakness-${idx}`} className="text-gray-700">
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* <div className="grid grid-cols-2 gap-4 mt-6 items-end">
          <div className="bg-brand-lightGray p-3 rounded-lg flex items-center justify-between">
            <div className="text-xs text-gray-600">部署平均</div>
            <div className="text-xl font-bold text-brand-darkBlue">
              {(deptData?.departmentAvg ?? 0).toFixed(1)}
            </div>
          </div>

          <div className="bg-brand-lightGray p-3 rounded-lg flex items-center justify-between">
            <div className="text-xs text-gray-600">全社平均</div>
            <div className="text-xl font-bold text-brand-darkBlue">
              {(deptData?.companyAvg ?? 0).toFixed(1)}
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default QuadrantMatrixDetails