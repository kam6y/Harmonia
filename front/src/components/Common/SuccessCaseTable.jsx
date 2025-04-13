// front/src/components/common/SuccessCaseTable.jsx
import React, { useState } from 'react';

const SuccessCaseTable = ({ data, categories }) => {
  const [filter, setFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);

  // 部署リストの取得
  const departments = [...new Set(data ? data.map(item => item.department) : [])];

  // フィルタリング済みデータ
  const filteredData = data ? data.filter(item => {
    const matchesCategory = !filter || item.category === filter;
    const matchesDepartment = !departmentFilter || item.department === departmentFilter;
    const matchesSearch = !search || 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.issue.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesDepartment && matchesSearch;
  }) : [];

  const clearFilters = () => {
    setFilter('');
    setDepartmentFilter('');
    setSearch('');
  };

  const handleRowClick = (item) => {
    setSelectedCase(item);
  };

  const closeDetails = () => {
    setSelectedCase(null);
  };

  // 親コンポーネントから受け取ったデータを使用
  const displayData = filteredData.length > 0 ? filteredData : data || [];
  const displayCategories = categories && categories.length > 0 ? categories : ["効率化", "教育", "マーケティング", "働き方"];

  // カテゴリーに対応する色とアイコンを取得
  const getCategoryStyle = (category) => {
    switch(category) {
      case '効率化':
        return { 
          bg: '#17839433', 
          border: '#178394',
          icon: (
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          )
        };
      case '教育':
        return { 
          bg: '#00A3B333', 
          border: '#00A3B3',
          icon: (
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path>
            </svg>
          )
        };
      case 'マーケティング':
        return { 
          bg: '#F2975933', 
          border: '#F29759',
          icon: (
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          )
        };
      case '働き方':
        return { 
          bg: '#FC7F7A33', 
          border: '#FC7F7A',
          icon: (
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          )
        };
      default:
        return { 
          bg: '#00425933', 
          border: '#004259',
          icon: (
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
            </svg>
          )
        };
    }
  };

  // モーダル表示用のコンポーネント
  const SuccessCaseDetails = ({ caseData, onClose }) => {
    if (!caseData) return null;
    
    const categoryStyle = getCategoryStyle(caseData.category);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
          {/* ヘッダー部分 */}
          <div className="bg-brand-darkBlue text-white p-4 rounded-t-lg relative">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold">{caseData.title}</h2>
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-300 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="absolute -bottom-4 left-4">
              <div 
                className="px-3 py-1 rounded-full shadow-md flex items-center text-sm font-bold" 
                style={{ backgroundColor: categoryStyle.border, color: 'white' }}
              >
                {categoryStyle.icon}
                {caseData.category}
              </div>
            </div>
          </div>
          
          {/* 内容部分 */}
          <div className="p-6 pt-8">            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-brand-lightGray p-3 rounded-md">
                <p className="text-sm text-gray-500 mb-1">担当部署</p>
                <p className="font-bold text-brand-darkBlue flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  {caseData.department}
                </p>
              </div>
              <div className="bg-brand-lightGray p-3 rounded-md">
                <p className="text-sm text-gray-500 mb-1">担当者</p>
                <p className="font-bold text-brand-darkBlue flex items-center">
                  <span className="w-7 h-7 rounded-full bg-brand-teal text-white text-sm flex items-center justify-center mr-2">
                    {caseData.manager.charAt(0)}
                  </span>
                  {caseData.manager}
                </p>
              </div>
              <div className="md:col-span-2 bg-brand-lightGray p-3 rounded-md">
                <p className="text-sm text-gray-500 mb-1">課題</p>
                <p className="font-bold text-brand-darkBlue">{caseData.issue}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg text-brand-darkBlue flex items-center mb-3">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                施策詳細
              </h3>
              <div className="border-l-4 border-brand-teal pl-4 py-2">
                <p className="text-gray-800" rows="4">
                  {caseData.description.replace(/\\n/g, "\n") || "詳細情報はまだ登録されていません。"}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-brand-teal text-white rounded-md hover:bg-brand-darkBlue transition focus:outline-none focus:ring-2 focus:ring-brand-teal font-bold"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
      {/* 説明テキスト */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <div className="inline-flex items-center gap-2 bg-brand-lightGray rounded-md px-4 py-2">
          <div className="text-brand-coral">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
            </svg>
          </div>
          <p className="text-gray-800 font-medium">行をクリックすると詳細画面に移動します</p>
        </div>
        
        {/* 表示件数 */}
        <div className="text-sm text-brand-darkBlue font-medium">
          {displayData.length}件の成功事例を表示中
        </div>
      </div>
      
      {/* フィルター部分 */}
      <div className="p-4 bg-brand-lightGray bg-opacity-30">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-grow md:flex-grow-0 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="施策名・課題で検索"
              className="pl-10 border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-brand-teal text-gray-800 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            className="border rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal text-gray-800 flex-grow md:flex-grow-0"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">カテゴリー: すべて</option>
            {displayCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select 
            className="border rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal text-gray-800 flex-grow md:flex-grow-0"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">担当部署: すべて</option>
            {departments.map(department => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
          
          {(filter || departmentFilter || search) && (
            <button 
              className="border bg-white rounded-md p-2 text-sm hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-brand-teal text-gray-800 flex items-center"
              onClick={clearFilters}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              フィルターをクリア
            </button>
          )}
        </div>
      </div>

      {/* テーブル部分 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-brand-darkBlue text-white">
              <th className="p-3 text-left font-bold">施策内容</th>
              <th className="p-3 text-left font-bold">課題カテゴリ</th>
              <th className="p-3 text-left font-bold">課題</th>
              <th className="p-3 text-left font-bold">担当者</th>
              <th className="p-3 text-left font-bold">担当部署</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((item, index) => {
              const categoryStyle = getCategoryStyle(item.category);
              return (
                <tr 
                  key={index} 
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-brand-lightGray bg-opacity-30'} hover:bg-brand-cyan hover:bg-opacity-10 cursor-pointer border-b border-gray-100 transition-colors text-gray-800`}
                  onClick={() => handleRowClick(item)}
                  title="クリックして詳細を表示"
                >
                  <td className="p-3 font-medium text-brand-darkBlue">{item.title}</td>
                  <td className="p-3">
                    <span 
                      className="inline-flex items-center px-2 py-1 rounded text-sm font-medium" 
                      style={{ 
                        backgroundColor: categoryStyle.bg, 
                        color: categoryStyle.border,
                        borderLeft: `3px solid ${categoryStyle.border}`
                      }}
                    >
                      {categoryStyle.icon}
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3 max-w-xs truncate">{item.issue}</td>
                  <td className="p-3">
                    <span className="flex items-center">
                      <span className="w-7 h-7 rounded-full bg-brand-teal text-white text-sm flex items-center justify-center mr-2">
                        {item.manager.charAt(0)}
                      </span>
                      {item.manager}
                    </span>
                  </td>
                  <td className="p-3">{item.department}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {displayData.length === 0 && (
        <div className="p-8 text-center">
          <div className="inline-block p-4 rounded-lg bg-brand-lightGray">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-gray-800 font-medium">条件に一致する施策がありません</p>
            <p className="text-gray-600 text-sm mt-1">フィルターを変更してください</p>
            <button 
              className="mt-3 px-4 py-2 bg-brand-teal text-white rounded hover:bg-opacity-90 transition"
              onClick={clearFilters}
            >
              すべての施策を表示
            </button>
          </div>
        </div>
      )}

      {selectedCase && (
        <SuccessCaseDetails 
          caseData={selectedCase} 
          onClose={closeDetails} 
        />
      )}
    </div>
  );
};

export default SuccessCaseTable;