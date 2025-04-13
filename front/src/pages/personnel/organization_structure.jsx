// front/src/pages/personnel/organization_structure.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import PersonnelHeader from "@/components/personnel/PersonnelHeader";
import PersonnelSubHeader from "@/components/common/SubHeader";
import axios from 'axios';

// クライアントサイドでのみ読み込むコンポーネント
const OrganizationChart = dynamic(() => import('../../components/personnel/OrganizationChart'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64">読み込み中...</div>
});

export default function OrganizationStructurePage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [startDate, setStartDate] = useState(''); // モーダル内で入力された日付（表示用：YYYY/MM/DD）
  const [selectedDate, setSelectedDate] = useState('');
  const [hasOrganization, setHasOrganization] = useState(false);
  const [dates, setDates] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ★ localStorage から tenant_id を取得（なければ1を使う）
  const [tenantId, setTenantId] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTenantId = localStorage.getItem("tenant_id");
      return storedTenantId ? JSON.parse(storedTenantId) : 1;
    }
    return 1;
  });

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost';

  // 今日の日付（YYYY-MM-DD形式）
  const today = new Date().toISOString().slice(0, 10);
  // 選択中の履歴の日付が今日以前かどうか（"YYYY-MM-DD" 同士で比較）
  const isPast = selectedDate && selectedDate < today;

  useEffect(() => {
    setIsMounted(true);
    fetchOrganizationDates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchOrganizationStructure(selectedDate);
    }
  }, [selectedDate]);

  // API から組織構造の日付一覧を取得
  const fetchOrganizationDates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${BACKEND_URL}/api/organization-structure`, {
        params: { tenant_id: tenantId } // ★ ここで tenantId を利用
      });

      if (response.data.success) {
        const availableDates = response.data.availableDates || [];
        setDates(availableDates);

        if (availableDates.length > 0) {
          // 最新の日付を選択
          setSelectedDate(availableDates[availableDates.length - 1]);
        }
      }
    } catch (error) {
      console.error('組織構造の日付一覧取得エラー:', error);
      setError('組織構造の日付一覧取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // API から特定日付の組織構造を取得
  const fetchOrganizationStructure = async (date) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${BACKEND_URL}/api/organization-structure`, {
        params: { tenant_id: tenantId, date: date } // ★ ここでも tenantId を利用
      });

      if (response.data.success) {
        const structure = response.data.structure || [];
        setOrganizations(structure);
        setHasOrganization(structure.length > 0);
      }
    } catch (error) {
      console.error('組織構造取得エラー:', error);
      setError('組織構造の取得に失敗しました');
      setHasOrganization(false);
    } finally {
      setLoading(false);
    }
  };

  // 履歴追加モーダルを表示
  const handleAddHistoryClick = () => {
    setStartDate('');
    setShowAddModal(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  // 履歴日付の追加（新規作成）
  const handleAddDate = () => {
    if (!startDate) {
      alert('日付を入力してください');
      return;
    }
    const inputDate = startDate.replace(/\//g, '-');
    if (new Date(inputDate).getTime() < new Date(today).getTime()) {
      alert('今日以前の日付での履歴追加はできません');
      return;
    }
    router.push({
      pathname: '/personnel/organization_structure_register',
      query: { date: inputDate, mode: 'new' }
    });
  };

  // 編集ページへ遷移
  const handleEditClick = () => {
    if (isPast) {
      alert('過去の履歴は編集できません');
      return;
    }
    router.push({
      pathname: '/personnel/organization_structure_register',
      query: { date: selectedDate, mode: 'edit', data: JSON.stringify(organizations) }
    });
  };

  // 組織データの削除確認モーダルを表示
  const handleDeleteRequest = () => {
    if (isPast) {
      alert('過去の履歴は削除できません');
      return;
    }
    setShowConfirmDeleteModal(true);
  };

  // 組織データの削除を実行
  const handleDeleteConfirmed = async () => {
    try {
      setLoading(true);

      const response = await axios.delete(`${BACKEND_URL}/api/organization-structure`, {
        data: { tenant_id: tenantId, date: selectedDate }
      });

      if (response.data.success) {
        fetchOrganizationDates();
        alert('組織構造を削除しました');
      } else {
        alert('削除に失敗しました: ' + response.data.message);
      }
    } catch (error) {
      console.error('組織構造削除エラー:', error);
      alert('組織構造の削除中にエラーが発生しました');
    } finally {
      setLoading(false);
      setShowConfirmDeleteModal(false);
    }
  };

  // 日付選択の処理
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  // 日付のフォーマット (YYYY-MM-DD -> YYYY/MM/DD)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  // 日付入力の処理
  const handleDateInput = (e) => {
    const inputDate = e.target.value;
    if (inputDate) {
      const formattedDate = formatDate(inputDate);
      setStartDate(formattedDate);
    } else {
      setStartDate('');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <PersonnelHeader />

      {/* サブヘッダー */}
      <PersonnelSubHeader title="組織構造" />

      {/* メインコンテンツ */}
      <div className="flex flex-1 bg-brand-lightGray pt-12">
        {/* サイドバー */}
        <div className="w-64 p-4">
          <button 
            onClick={handleAddHistoryClick}
            className="border border-brand-cyan text-brand-cyan px-4 py-2 rounded hover:bg-brand-lightGray mb-4 w-full text-center"
          >
            履歴を追加
          </button>
          
          <div className="mt-4">
            {dates.length > 0 ? (
              dates.map(date => (
                <div key={date} className="mt-2">
                  <button 
                    onClick={() => handleDateClick(date)}
                    className={`block text-left px-2 py-1 rounded w-full ${
                      selectedDate === date 
                        ? 'bg-brand-cyan text-white' 
                        : 'text-brand-darkBlue hover:bg-brand-lightGray'
                    }`}
                  >
                    {date}
                  </button>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">
                {loading ? '読み込み中...' : '組織構造がありません'}
              </div>
            )}
          </div>
        </div>

        {/* メインエリア */}
        <div className="flex-1 p-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
              <button 
                onClick={() => fetchOrganizationDates()}
                className="mt-2 text-sm underline hover:text-red-800"
              >
                再試行
              </button>
            </div>
          )}
          
          <div className="bg-white p-6 rounded-lg shadow-sm min-h-[80vh] max-w-[80vw]">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-cyan"></div>
              </div>
            ) : hasOrganization ? (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <div className="text-brand-darkBlue">適用開始日: {selectedDate}</div>
                  <div>
                    <button 
                      onClick={handleEditClick}
                      disabled={isPast}
                      className={`text-brand-cyan border border-brand-cyan rounded px-4 py-1 mr-2 hover:bg-brand-lightGray ${isPast ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      編集
                    </button>
                    <button 
                      onClick={handleDeleteRequest}
                      disabled={isPast}
                      className={`text-brand-coral hover:text-red-700 ${isPast ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      削除
                    </button>
                  </div>
                </div>

                {/* 組織図 */}
                <div className="flex justify-center items-center mt-8 overflow-auto h-[calc(100vh-240px)]">
                  {isMounted && organizations.length > 0 ? (
                    <div className="flex flex-row w-full" style={{ paddingBottom: '100px', paddingLeft: '50px', paddingRight: '50px' }}>
                      <OrganizationChart 
                        organizations={organizations}
                        onAddChild={() => {}}
                        onDeleteOrg={() => {}}
                        readOnly={true}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-brand-darkBlue">
                      表示するデータがありません
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center h-full">
                <div className="text-center py-8 text-brand-darkBlue text-xl">
                  {selectedDate ? `${selectedDate}の組織データがありません` : '組織データがありません'}
                  <div className="mt-4">
                    <button 
                      onClick={handleAddHistoryClick}
                      className="border border-brand-cyan text-brand-cyan px-4 py-2 rounded hover:bg-brand-lightGray"
                    >
                      新しい組織構造を作成
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 履歴追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-brand-darkBlue">履歴を追加</h3>
              <button onClick={handleCloseModal} className="text-brand-darkBlue hover:text-brand-teal">
                ✕
              </button>
            </div>
            <div className="mb-6">
              <label className="block mb-2 text-brand-darkBlue">適用開始日</label>
              <input 
                type="date" 
                className="border rounded p-2 w-full text-brand-darkBlue"
                onChange={handleDateInput}
              />
            </div>
            <button 
              onClick={handleAddDate}
              className="bg-brand-cyan text-white px-4 py-2 rounded w-full hover:bg-brand-teal"
              disabled={!startDate}
            >
              追加
            </button>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {showConfirmDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-brand-darkBlue">削除の確認</h3>
              <button onClick={() => setShowConfirmDeleteModal(false)} className="text-brand-darkBlue hover:text-brand-teal">
                ✕
              </button>
            </div>
            <div className="mb-6">
              <p className="text-brand-darkBlue mb-2">
                以下の日付の組織構造を削除してよろしいですか？
              </p>
              <p className="font-bold text-brand-coral mb-4">
                {selectedDate}
              </p>
              <p className="text-sm text-gray-600">
                この操作は元に戻せません。
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowConfirmDeleteModal(false)}
                className="border border-brand-darkBlue text-brand-darkBlue px-4 py-2 rounded w-full hover:bg-brand-lightGray"
              >
                キャンセル
              </button>
              <button 
                onClick={handleDeleteConfirmed}
                className="bg-brand-coral text-white px-4 py-2 rounded w-full hover:bg-red-700"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}