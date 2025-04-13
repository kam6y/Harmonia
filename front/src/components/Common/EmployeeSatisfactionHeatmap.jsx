import React, { useState } from 'react'

const EmployeeSatisfactionHeatmap = ({ data, summaryText }) => {
  const [selectedMetric, setSelectedMetric] = useState('gap')
  const [showComparison, setShowComparison] = useState(false)
  const [showCustomQuestions, setShowCustomQuestions] = useState(true)
  const [hoveredDepartment, setHoveredDepartment] = useState(null)

  const metricOptions = [
    { value: 'gap', label: 'GAP値' },
    { value: 'satisfaction', label: '満足値' },
    { value: 'expectation', label: '期待値' }
  ]

  // 定数（px 単位）
  const HEADER_ROW_HEIGHT = 41
  const DOUBLE_HEADER_HEIGHT = HEADER_ROW_HEIGHT * 2
  const TRIPLE_HEADER_HEIGHT = HEADER_ROW_HEIGHT * 3
  const ROW_HEIGHT = 53
  const DEFAULT_COL_WIDTH = 80
  const CUSTOM_COL_WIDTH = 80

  /**
   * 値に応じた背景色と文字色を HSL のグラデーションで返す関数
   * - showComparison が true の場合：
   *   ・selectedMetric が 'gap' の場合は、前回比でもグラデーションを適用（-1～1 の範囲）
   *   ・その他は従来の固定色（ステップ状）
   * - showComparison が false の場合：全て統一したグラデーションを適用
   */
  const getStyles = (value) => {
    if (value === null || value === undefined) {
      return { style: { backgroundColor: '#ffffff', color: '#4a5568' } }
    }
    if (showComparison) {
      if (selectedMetric === 'gap') {
        // GAPの場合、前回比でもグラデーション: 値の範囲は -1 ～ 1 とする
        const minVal = -1, maxVal = 1;
        const clamped = Math.max(minVal, Math.min(maxVal, value));
        const norm = (clamped - minVal) / (maxVal - minVal); // 0〜1に正規化
        // norm 0 -> hue 120 (緑), norm 1 -> hue 0 (赤)
        const hue = (1 - norm) * 120;
        return {
          style: {
            backgroundColor: `hsl(${hue}, 70%, 85%)`,
            color: `hsl(${hue}, 70%, 25%)`
          }
        }
      } else {
        // 他の指標の場合は、従来の固定色（ステップ状）
        if (value > 1) return { style: { backgroundColor: '#FEF3C7', color: '#92400E' } }
        if (value > 0) return { style: { backgroundColor: '#BBF7D0', color: '#065F46' } }
        if (value > -1) return { style: { backgroundColor: '#ECFCCB', color: '#166534' } }
        if (value > -2) return { style: { backgroundColor: '#FECACA', color: '#B91C1C' } }
        if (value > -3) return { style: { backgroundColor: '#FCA5A5', color: '#991B1B' } }
        return { style: { backgroundColor: '#F87171', color: '#7F1D1D' } }
      }
    } else {
      if (selectedMetric === 'satisfaction' || selectedMetric === 'expectation') {
        // 満足値・期待値: 値の範囲 2～4 を使う（例）
        const minVal = 2, maxVal = 4;
        const clamped = Math.max(minVal, Math.min(maxVal, value));
        const ratio = (clamped - minVal) / (maxVal - minVal);
        const hue = ratio * 120; // 0 (赤)～120 (緑)
        return {
          style: {
            backgroundColor: `hsl(${hue}, 70%, 85%)`,
            color: `hsl(${hue}, 70%, 25%)`
          }
        }
      } else if (selectedMetric === 'gap') {
        // GAP値: 値の範囲 -1～1
        const minVal = -2, maxVal = 2;
        const clamped = Math.max(minVal, Math.min(maxVal, value));
        const norm = (clamped - minVal) / (maxVal - minVal);
        const hue = (1 - norm) * 120;
        return {
          style: {
            backgroundColor: `hsl(${hue}, 70%, 85%)`,
            color: `hsl(${hue}, 70%, 25%)`
          }
        }
      }
    }
  }

  const formatCategoryName = (category) => {
    if (category.length <= 10) {
      return <div className="whitespace-normal text-center text-xs">{category}</div>
    }
    const middle = Math.ceil(category.length / 2)
    return (
      <div className="whitespace-normal text-center">
        <div className="text-xs">{category.substring(0, middle)}</div>
        <div className="text-xs">{category.substring(middle)}</div>
      </div>
    )
  }

  const getCellValue = (row, category, isCustom) => {
    const categoryData = isCustom ? row.customCategories : row.defaultCategories;
    switch (selectedMetric) {
      case 'satisfaction':
        return categoryData[category]?.satisfaction || null;
      case 'expectation':
        return categoryData[category]?.expectation || null;
      case 'gap':
        return categoryData[category]?.gap || null;
      default:
        return null;
    }
  }

  const navigateToDepartmentDetail = (departmentId, departmentName) => {
    if (departmentName === '全社') return;
    const currentUrl = new URL(window.location.href);
    const pathSegments = currentUrl.pathname.split('/');
    pathSegments.pop();
    const basePath = pathSegments.join('/');
    const newUrl = new URL(`${basePath}/issue`, window.location.origin);
    newUrl.searchParams.set('departmentId', departmentId);
    window.location.href = `${newUrl.pathname}${newUrl.search}`;
  }

  // 動的にキーを取得
  const firstRow = data && data.length > 0 ? data[0] : {};
  const defaultCategoryKeys = firstRow.defaultCategories ? Object.keys(firstRow.defaultCategories) : [];
  const customCategoryKeys = firstRow.customCategories ? Object.keys(firstRow.customCategories) : [];

  return (
    <div className="w-full mx-auto bg-white p-4 rounded-lg shadow-sm">
      {/* サマリー部分 */}
      {summaryText && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-md font-medium text-blue-800 mb-1">サマリー</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{summaryText}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap justify-between items-center">
        <div className="flex flex-wrap gap-3 mb-2 sm:mb-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">指標:</span>
            <select
              className="px-2 py-1 border rounded text-sm bg-white text-gray-800 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 focus:outline-none transition-all"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              {metricOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showComparison}
                onChange={() => setShowComparison(!showComparison)}
                className="h-4 w-4 rounded text-blue-500 focus:ring-blue-400"
              />
              <span className="text-sm text-gray-700">前回比を表示</span>
            </label>
          </div>
          <button
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${showCustomQuestions ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setShowCustomQuestions(!showCustomQuestions)}
          >
            {showCustomQuestions ? 'デフォルト質問のみ' : '追加質問を表示'}
          </button>
        </div>
        
        <div className="flex items-center text-sm bg-gray-50 px-3 py-2 rounded-md border">
          <span className="mr-2 text-gray-700 font-medium">凡例:</span>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-300 mr-1 rounded-sm"></div>
              <span className="text-red-800">要改善</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-200 mr-1 rounded-sm"></div>
              <span className="text-green-800">良好</span>
            </div>
          </div>
        </div>
      </div>

      {/* ヒートマップテーブル */}
      <div className="border rounded-lg shadow-sm overflow-hidden">
        <div className="flex">
          {/* 左側：部署名と指標値 */}
          <div className="border-r">
            <table className="border-collapse" style={{ verticalAlign: 'top' }}>
              <thead>
                <tr className="bg-gray-100" style={{ height: `${TRIPLE_HEADER_HEIGHT}px` }}>
                  <th className="border-b border-r p-1 text-left text-sm text-gray-700" style={{ width: '120px' }}>
                    部署
                  </th>
                  <th className="border-b p-1 text-center text-sm text-gray-700" style={{ width: '50px' }}>
                    {selectedMetric === 'satisfaction'
                      ? '満足値'
                      : selectedMetric === 'expectation'
                      ? '期待値'
                      : 'GAP'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} style={{ height: `${ROW_HEIGHT}px` }}>
                    <td
                      className={`border-b border-r p-1 text-sm ${hoveredDepartment === row.id ? 'bg-blue-50 text-blue-700' : 'text-gray-800'}`}
                      onMouseEnter={() => setHoveredDepartment(row.id)}
                      onMouseLeave={() => setHoveredDepartment(null)}
                    >
                      <div className="flex items-center">
                        {row.department === '全社' ? (
                          <span className="flex items-center w-full text-left px-1 py-0.5 cursor-default" aria-label="全社は詳細遷移なし" title="全社は詳細遷移なし">
                            {row.department}
                          </span>
                        ) : (
                          <button
                            onClick={() => navigateToDepartmentDetail(row.id, row.department)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                navigateToDepartmentDetail(row.id, row.department)
                              }
                            }}
                            className="flex items-center w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-sm px-1 py-0.5"
                            tabIndex={0}
                            aria-label={`${row.department}の詳細を表示`}
                            title={`${row.department}の詳細を表示`}
                          >
                            <div className="flex items-center gap-1">
                              <span>{row.department}</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="border-b p-1 text-center text-sm text-gray-800">
                      {showComparison 
                        ? (selectedMetric === 'satisfaction'
                          ? row.satisfactionComparison
                          : selectedMetric === 'expectation'
                          ? row.expectationComparison
                          : row.gapComparison)
                        : (selectedMetric === 'satisfaction'
                          ? row.satisfaction
                          : selectedMetric === 'expectation'
                          ? row.expectation
                          : row.gap)
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 右側：質問部 */}
          <div className="overflow-x-auto" style={{ maxWidth: 'calc(100% - 170px)', verticalAlign: 'top' }}>
            <table className="border-collapse" style={{ verticalAlign: 'top' }}>
              <thead>
                <tr className="bg-gray-100" style={{ height: `${HEADER_ROW_HEIGHT}px` }}>
                  <th
                    className="border-b p-1 text-center bg-gray-200 text-sm text-gray-800"
                    colSpan={defaultCategoryKeys.length}
                  >
                    デフォルト質問
                  </th>
                  {showCustomQuestions && (
                    <th
                      className="border-b p-1 text-center bg-blue-100 text-sm text-gray-800"
                      colSpan={customCategoryKeys.length}
                    >
                      追加質問
                    </th>
                  )}
                </tr>
                <tr className="bg-gray-100" style={{ height: `${DOUBLE_HEADER_HEIGHT}px` }}>
                  {defaultCategoryKeys.map((key, index) => (
                    <th
                      key={`default-${index}`}
                      className="border-b border-r p-1 text-center text-xs text-gray-700"
                      style={{ width: `${DEFAULT_COL_WIDTH}px` }}
                      title={key}
                    >
                      {formatCategoryName(key)}
                    </th>
                  ))}
                  {showCustomQuestions &&
                    customCategoryKeys.map((key, index) => (
                      <th
                        key={`custom-${index}`}
                        className="border-b border-r p-1 text-center bg-blue-50 text-xs text-gray-800"
                        style={{ width: `${CUSTOM_COL_WIDTH}px` }}
                        title={key}
                      >
                        {formatCategoryName(key)}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} style={{ height: `${ROW_HEIGHT}px` }}>
                    {defaultCategoryKeys.map((key, i) => {
                      const value = showComparison 
                        ? row.defaultCategories[key]?.[`${selectedMetric}Comparison`] 
                        : getCellValue(row, key, false);
                      const { style } = getStyles(value);
                      return (
                        <td
                          key={`default-cell-${idx}-${i}`}
                          className="border-b border-r p-1 text-center text-sm"
                          style={{ width: `${DEFAULT_COL_WIDTH}px`, ...style }}
                        >
                          {value !== undefined && value !== null ? value : '0'}
                        </td>
                      )
                    })}
                    {showCustomQuestions &&
                      customCategoryKeys.map((key, i) => {
                        const value = showComparison 
                          ? row.customCategories[key]?.[`${selectedMetric}Comparison`] 
                          : getCellValue(row, key, true);
                        const { style } = getStyles(value);
                        return (
                          <td
                            key={`custom-cell-${idx}-${i}`}
                            className="border-b border-r p-1 text-center text-sm"
                            style={{ width: `${CUSTOM_COL_WIDTH}px`, ...style }}
                          >
                            {value !== undefined && value !== null ? value : '0'}
                          </td>
                        )
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        * {showComparison 
          ? `表示されているのは${selectedMetric === 'satisfaction' ? '満足値' : selectedMetric === 'expectation' ? '期待値' : 'GAP値'}の前回比です。` 
          : `表示されているのは現在の${selectedMetric === 'satisfaction' ? '満足値' : selectedMetric === 'expectation' ? '期待値' : 'GAP値'}です。`}
      </div>
    </div>
  )
}

export default EmployeeSatisfactionHeatmap