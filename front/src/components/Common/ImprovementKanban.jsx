import React, { useState, useEffect } from 'react';
import MeasureModal from '../common/MeasureModal';
import { useRouter } from 'next/router';

const statuses = [
  { id: 'planning', name: 'planning', color: 'bg-brand-cyan' },
  { id: 'in_progress', name: 'in_progress', color: 'bg-brand-teal' },
  { id: 'systematization', name: 'systematization', color: 'bg-brand-orange' },
  { id: 'archived', name: 'archived', color: 'bg-brand-darkBlue text-white' },
];

const ImprovementKanban = ({ 
  selectedOrganization = 'AAA',
  selectedOrganizationName,
  initialImprovements,
  showRegisterButton = true
}) => {
  const router = useRouter();

  const [selectedMeasure, setSelectedMeasure] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [improvements, setImprovements] = useState(initialImprovements || []);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [responsibleFilter, setResponsibleFilter] = useState('');
  const [selectedTab, setSelectedTab] = useState('すべて');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    setImprovements(initialImprovements || []);
  }, [initialImprovements]);

  // API経由でステータスを更新する関数
  const updateImprovementStatus = async (improvementId, newStatus) => {
    try {
      const response = await fetch(`http://localhost/api/kanban/improvements/${improvementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) {
        throw new Error('Status update failed');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // API経由で施策を削除する関数
  const deleteImprovementAPI = async (improvementId) => {
    try {
      const response = await fetch(`http://localhost/api/kanban/improvements/${improvementId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Delete failed');
      }
      return true;
    } catch (error) {
      console.error('Error deleting improvement:', error);
      return false;
    }
  };

  // モーダル表示のための関数
  const openModal = (measure) => {
    setSelectedMeasure(measure);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMeasure(null);

    const { pathname, query } = router;
    const newQuery = { ...query };
    delete newQuery.modal;
    delete newQuery.measureId;
    router.replace({ pathname, query: newQuery }, undefined, { shallow: true });
  };

  useEffect(() => {
    const { query } = router;
    const shouldOpenModal = query.modal === 'measure' && query.measureId;
    if (shouldOpenModal && !isModalOpen) {
      const measureToOpen = improvements.find(
        (item) => String(item.id) === String(query.measureId)
      );
      if (measureToOpen) {
        openModal(measureToOpen);
      }
    }
  }, [router.query, improvements, isModalOpen]);

  const getFilteredImprovements = () => {
    return improvements.filter(improvement => {
      const matchesSearch = 
        improvement.title.toLowerCase().includes(search.toLowerCase()) ||
        improvement.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter ? improvement.category === categoryFilter : true;
      const matchesResponsible = responsibleFilter ? improvement.responsible === responsibleFilter : true;
      const matchesTab = selectedTab === 'すべて' ? true : 
                        (selectedTab === '以下の条件で絞り込む' && (search || categoryFilter || responsibleFilter)) ? true : 
                        false;
      return matchesSearch && matchesCategory && matchesResponsible && matchesTab;
    });
  };

  const getImprovementsByStatus = (status) => {
    return getFilteredImprovements()
        .filter(item => item.status === status)
        .sort((a, b) => sortOrder === 'asc' ? a.id - b.id : b.id - a.id);
  };

  // 施策を削除する関数（API呼び出し後に状態更新）
  const deleteImprovement = async (id) => {
    const success = await deleteImprovementAPI(id);
    if (success) {
      setImprovements(improvements.filter(item => item.id !== id));
    }
  };

  // ドラッグ開始時
  const onDragStart = (e, id) => {
    e.dataTransfer.setData('id', id);
  };

  // ドロップ許可
  const onDragOver = (e) => {
    e.preventDefault();
  };

  // ドロップ時にステータス変更＆API更新
  const onDrop = async (e, status) => {
    const id = e.dataTransfer.getData('id');
    const improvementId = parseInt(id);
    const updateResult = await updateImprovementStatus(improvementId, status);
    if (updateResult) {
      setImprovements(improvements.map(item => {
        if (item.id === improvementId) {
          return { ...item, status };
        }
        return item;
      }));
    }
  };

  const categories = [...new Set(improvements.map(item => item.category))];
  const responsibles = [...new Set(improvements.map(item => item.responsible))];

  const handleRegisterClick = () => {
    router.push('/manager/measures_register');
  };

  const getCardColor = (status) => {
    switch(status) {
      case 'planning': return 'border-l-4 border-l-brand-cyan border-t border-r border-b border-gray-200 bg-white';
      case 'in_progress': return 'border-l-4 border-l-brand-teal border-t border-r border-b border-gray-200 bg-white';
      case 'systematization': return 'border-l-4 border-l-brand-orange border-t border-r border-b border-gray-200 bg-white';
      case 'archived': return 'border-l-4 border-l-brand-darkBlue border-t border-r border-b border-gray-200 bg-white';
      default: return '';
    }
  };

  const getColumnBgColor = (statusId) => 'bg-gray-200';

  const formatOrgName = (orgId) => `組織${orgId}`;

  return (
    <div className='mt-4'>
      <div className="flex items-center ml-6 mb-4">
        <h1 className="text-2xl font-bold text-brand-darkBlue mr-4">
          {formatOrgName(selectedOrganizationName)}の施策一覧
        </h1>
        {showRegisterButton && (
          <button 
            className="bg-brand-orange hover:bg-brand-coral text-white py-3 px-6 rounded-md text-base font-medium shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-opacity-50 mr-6 ml-10"
            onClick={handleRegisterClick}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新しい施策を登録する
            </div>
          </button>
        )}
      </div>

      <div className="p-6 text-black bg-white rounded-lg mx-6 min-h-1/2">
        <div className="bg-brand-lightGray p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="施策名・カテゴリーで検索"
              className="border rounded-md p-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-brand-teal"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="border rounded-md p-2 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-brand-teal"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">カテゴリー: すべて</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              className="border rounded-md p-2 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-brand-teal"
              value={responsibleFilter}
              onChange={(e) => setResponsibleFilter(e.target.value)}
            >
              <option value="">担当者: すべて</option>
              {responsibles.map(responsible => (
                <option key={responsible} value={responsible}>{responsible}</option>
              ))}
            </select>
            <div className="flex items-center ml-auto gap-4">
              <div className="flex items-center">
                <span className="mr-2 text-gray-600">作成日時：</span>
                <select
                  className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="asc">昇順▲</option>
                  <option value="desc">降順▼</option>
                </select>
              </div>
              <button className="bg-brand-lightGray border rounded-md p-2 text-sm text-gray-700 hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-brand-teal">
                新しいビューとして保存
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statuses.map((status) => (
            <div 
              key={status.id} 
              className={`rounded-lg shadow-sm overflow-hidden ${getColumnBgColor(status.id)}`}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, status.name)}
            >
              <div className={`p-3 text-white font-medium ${status.color}`}>
                <div className="flex justify-between items-center">
                  <span>{status.name}</span>
                  <span className="bg-white text-gray-700 text-xs px-2 py-1 rounded-full">
                    {getImprovementsByStatus(status.name).length}
                  </span>
                </div>
              </div>
              <div className="p-3 max-h-screen overflow-y-auto">
                {getImprovementsByStatus(status.name).length === 0 ? (
                  <div className="text-center py-6 text-gray-400">施策なし</div>
                ) : (
                  <div className="space-y-3">
                    {getImprovementsByStatus(status.name).map(improvement => (
                      <div 
                        key={improvement.id} 
                        className={`p-3 rounded-md shadow-md hover:shadow-lg transition-all duration-200 ${getCardColor(improvement.status)} cursor-pointer`}
                        draggable
                        onDragStart={(e) => onDragStart(e, improvement.id)}
                        onClick={() => openModal(improvement)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="w-full">
                            <div className="flex justify-between items-start w-full">
                              <h3 className="font-medium text-gray-800">{improvement.title}</h3>
                              <button
                                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-brand-coral transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-coral"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteImprovement(improvement.id);
                                }}
                                title="削除"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                            <div className="mt-2 text-sm text-gray-600 space-y-1">
                              <div className="flex items-center">
                                <span className="w-24">施策</span>
                                <span>{improvement.title}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="w-24">カテゴリ</span>
                                <span className="px-2 py-1 bg-brand-lightGray rounded-md text-xs">{improvement.category}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="w-24">責任者</span>
                                <span className="flex items-center">
                                  <span className="w-6 h-6 rounded-full bg-brand-teal bg-opacity-20 text-brand-teal text-xs flex items-center justify-center mr-1">
                                    {improvement.responsible?.charAt(0) || '-'}
                                  </span>
                                  {improvement.responsible}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {showRegisterButton && (
          <div className="fixed bottom-8 right-8 md:hidden z-10">
            <button 
              className="bg-brand-orange hover:bg-brand-coral text-white p-3 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-brand-orange"
              onClick={handleRegisterClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}

        <MeasureModal 
          isOpen={isModalOpen}
          onClose={closeModal}
          measure={selectedMeasure}
        />
      </div>
    </div>
  );
};

export default ImprovementKanban;