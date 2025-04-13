// front/src/pages/personnel/organization_structure_register.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import axios from 'axios';
import PersonnelHeader from "@/components/personnel/PersonnelHeader";
import PersonnelSubHeader from "@/components/common/SubHeader";

// クライアントサイドでのみ読み込むコンポーネント
const OrganizationChart = dynamic(() => import('../../components/personnel/OrganizationChart'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64">読み込み中...</div>
});

const OrganizationStructureRegisterPage = () => {
  const router = useRouter();
  const [organizations, setOrganizations] = useState([]);
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [hasOrganization, setHasOrganization] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [orgToDelete, setOrgToDelete] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '' });
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('new'); // 'new' または 'edit'

  // ★ localStorage から tenant_id を取得（なければ1を使う）
  const [tenantId, setTenantId] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTenantId = localStorage.getItem("tenant_id");
      return storedTenantId ? JSON.parse(storedTenantId) : 1;
    }
    return 1;
  });

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost';

  useEffect(() => {
    if (!router.isReady) return;
    setIsMounted(true);

    const { date, mode, data } = router.query;
    if (mode) {
      setMode(mode);
    }
    if (date) {
      setSelectedDate(date);
    }

    if (mode === 'edit') {
      // 編集モード：既存データを読み込む
      if (data) {
        // URLパラメータに直接データがある場合
        try {
          const parsedData = JSON.parse(data);
          setOrganizations(parsedData);
          setHasOrganization(parsedData.length > 0);
        } catch (err) {
          console.error('Failed to parse organization data:', err);
          // パースできなければAPIから取得
          if (date) {
            fetchOrganizationStructure(date);
          }
        }
      } else if (date) {
        // editモード かつ dataがない場合
        fetchOrganizationStructure(date);
      }
    } else if (mode === 'new') {
      // 新規モード：最新の日付の組織構造があれば読み込む
      fetchLatestStructure();
    }
  }, [router.isReady, router.query]);

  /**
   * 指定した日付の組織構造を取得
   */
  const fetchOrganizationStructure = async (date) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${BACKEND_URL}/api/organization-structure`, {
        params: { tenant_id: tenantId, date } // ★ tenantIdを付与
      });

      if (response.data.success) {
        const structure = response.data.structure || [];
        setOrganizations(structure);
        setHasOrganization(structure.length > 0);
      }
    } catch (err) {
      console.error('組織構造取得エラー:', err);
      setError('組織構造の取得に失敗しました');
      setHasOrganization(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 既存の履歴があれば、そのうち一番新しい日付のデータを取得する
   */
  const fetchLatestStructure = async () => {
    try {
      setLoading(true);
      setError(null);

      // まず全ての日付一覧を取得
      const res = await axios.get(`${BACKEND_URL}/api/organization-structure`, {
        params: { tenant_id: tenantId }
      });
      if (res.data.success) {
        const dates = res.data.availableDates || [];
        // もし既に履歴があれば、最も新しい日付のデータを読み込む
        if (dates.length > 0) {
          const latestDate = dates[dates.length - 1];
          const res2 = await axios.get(`${BACKEND_URL}/api/organization-structure`, {
            params: { tenant_id: tenantId, date: latestDate }
          });
          if (res2.data.success) {
            const structure = res2.data.structure || [];
            setOrganizations(structure);
            setHasOrganization(structure.length > 0);
          }
        } else {
          // 履歴が全くない場合は空のまま
          setOrganizations([]);
          setHasOrganization(false);
        }
      }
    } catch (err) {
      console.error('最新の組織構造の取得エラー:', err);
      setError('最新の組織構造の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 新規or編集した組織構造を保存
   */
  const handleSave = async () => {
    try {
      if (!selectedDate) {
        setError('適用開始日が設定されていません');
        return;
      }

      if (!hasOrganization || organizations.length === 0) {
        setError('保存する組織構造がありません');
        return;
      }

      setLoading(true);
      setError(null);

      // 新規レコードとして挿入する方式
      const response = await axios.post(`${BACKEND_URL}/api/organization-structure`, {
        tenant_id: tenantId, // ★ tenantIdを付与
        start_date: selectedDate,
        organizations
      });

      if (response.data.success) {
        alert('組織構造を保存しました');
        router.push('/personnel/organization_structure');
      } else {
        setError('保存に失敗しました: ' + (response.data.message || '不明なエラー'));
      }
    } catch (err) {
      console.error('組織構造保存エラー:', err);
      setError('組織構造の保存に失敗しました: ' + (err.response?.data?.message || err.message || '不明なエラー'));
    } finally {
      setLoading(false);
    }
  };

  // 以下、組織の追加・削除ロジックなど
  // --------------------------------------------
  // 組織ツリーから全ての組織コードを集める関数
  const getAllOrgCodes = (orgs) => {
    let codes = [];
    const traverse = (nodes) => {
      if (!nodes) return;
      nodes.forEach(node => {
        codes.push(node.code);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(orgs);
    return codes;
  };

  // 最大の組織コードを計算する関数
  const getNextOrgCode = () => {
    const allCodes = getAllOrgCodes(organizations);
    if (allCodes.length === 0) return '0001';

    const numericCodes = allCodes.map(code => parseInt(code, 10)).filter(num => !isNaN(num));
    if (numericCodes.length === 0) return '0001';

    const maxCode = Math.max(...numericCodes);
    return String(maxCode + 1).padStart(4, '0');
  };

  // サンプル組織を追加
  const addSampleOrganizations = () => {
    const headOffice = {
      id: Date.now(),
      name: '本社',
      code: '0001',
      startDate: selectedDate,
      children: []
    };
    setOrganizations([headOffice]);
    setHasOrganization(true);
  };

  // 組織追加ボタンのハンドラ
  const handleAddOrgClick = (parent = null) => {
    setSelectedParent(parent);
    const nextCode = getNextOrgCode();
    setFormData({ code: nextCode, name: '' });
    setShowAddOrgModal(true);
  };

  // 組織削除ボタンのハンドラ
  const handleDeleteOrgClick = (org) => {
    setOrgToDelete(org);
    setShowDeleteModal(true);
  };

  // 組織追加の処理
  const handleAddOrg = () => {
    if (!formData.code || !formData.name) return;

    // コードの重複チェック
    const allCodes = getAllOrgCodes(organizations);
    if (allCodes.includes(formData.code)) {
      alert('この組織コードは既に使用されています。別のコードを入力してください。');
      return;
    }

    const newOrg = {
      id: Date.now(),
      name: formData.name,
      code: formData.code,
      startDate: selectedDate,
      children: []
    };

    if (selectedParent) {
      // 既存組織の子として追加
      const addChildToParent = (orgs) => {
        return orgs.map(org => {
          if (org.id === selectedParent.id) {
            return { ...org, children: [...(org.children || []), newOrg] };
          } else if (org.children && org.children.length > 0) {
            return { ...org, children: addChildToParent(org.children) };
          }
          return org;
        });
      };
      setOrganizations(addChildToParent([...organizations]));
    } else {
      // ルート組織として追加
      setOrganizations([...organizations, newOrg]);
    }

    setShowAddOrgModal(false);
    setHasOrganization(true);
  };

  // 組織削除の処理
  const handleDeleteOrg = () => {
    if (!orgToDelete) return;

    // 再帰的に組織を削除する関数
    const removeOrgFromTree = (orgs) => {
      const filteredOrgs = orgs.filter(org => org.id !== orgToDelete.id);
      return filteredOrgs.map(org => {
        if (org.children && org.children.length > 0) {
          return {
            ...org,
            children: removeOrgFromTree(org.children)
          };
        }
        return org;
      });
    };

    const updatedOrgs = removeOrgFromTree([...organizations]);
    setOrganizations(updatedOrgs);

    if (updatedOrgs.length === 0) {
      setHasOrganization(false);
    }

    setShowDeleteModal(false);
    setOrgToDelete(null);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <PersonnelHeader />
      {/* サブヘッダー */}
      <PersonnelSubHeader title="組織構造" />

      <div className="flex-1 bg-brand-lightGray p-6 overflow-auto pt-16">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-sm underline hover:text-red-800 ml-2"
            >
              閉じる
            </button>
          </div>
        )}

        {/* コントロールバー */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => router.push('/personnel/organization_structure')} 
              className="flex items-center text-brand-darkBlue hover:text-brand-teal"
            >
              <span className="mr-2">←</span> {mode === 'new' ? '作成をやめる' : '編集をやめる'}
            </button>
          </div>
          <div className="flex items-center">
            <div className="text-brand-darkBlue mr-4">適用開始日: {selectedDate}</div>
            <button 
              onClick={handleSave}
              className={`px-4 py-2 rounded ${hasOrganization && !loading 
                ? 'bg-brand-cyan text-white hover:bg-brand-teal' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              disabled={!hasOrganization || loading}
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </div>

        {/* 組織図エリア */}
        <div className="bg-white rounded-lg shadow-sm p-6 min-h-[calc(100vh-240px)] overflow-hidden">
          <div className="overflow-auto h-full" style={{ paddingBottom: '100px', paddingLeft: '50px', paddingRight: '50px' }}>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-cyan"></div>
              </div>
            ) : isMounted ? (
              hasOrganization ? (
                <OrganizationChart 
                  organizations={organizations}
                  onAddChild={handleAddOrgClick}
                  onDeleteOrg={handleDeleteOrgClick}
                />
              ) : (
                <div className="flex flex-col justify-center items-center h-64 gap-4 mt-24">
                  <p className="text-gray-500 mb-2">
                    組織が登録されていません。新しい組織を追加してください。
                  </p>
                  <button 
                    onClick={() => handleAddOrgClick()}
                    className="text-4xl text-gray-500 hover:text-brand-darkBlue w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center"
                  >
                    +
                  </button>
                  <p className="text-gray-500 my-2">または</p>
                  <button
                    onClick={addSampleOrganizations}
                    className="text-brand-cyan border border-brand-cyan px-4 py-2 rounded hover:bg-brand-lightGray"
                  >
                    サンプル組織を追加
                  </button>
                </div>
              )
            ) : (
              <div className="flex justify-center items-center h-64">読み込み中...</div>
            )}
          </div>
        </div>
      </div>

      {/* 組織追加モーダル */}
      {showAddOrgModal && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-brand-darkBlue">組織を追加</h3>
              <button onClick={() => setShowAddOrgModal(false)} className="text-brand-darkBlue hover:text-brand-teal">
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 text-brand-darkBlue">組織コード</label>
              <input 
                type="text" 
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="border rounded p-2 w-full text-brand-darkBlue"
                placeholder="例: 0002"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 text-brand-darkBlue">組織名</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border rounded p-2 w-full text-brand-darkBlue"
                placeholder="例: 人事部"
              />
            </div>
            
            <div className="mb-6">
              <label className="block mb-2 text-brand-darkBlue">上位組織</label>
              <input 
                type="text" 
                value={selectedParent ? selectedParent.name : 'なし'}
                className="border rounded p-2 w-full text-brand-darkBlue bg-brand-lightGray"
                disabled
              />
            </div>
            
            <button 
              onClick={handleAddOrg}
              className={`w-full px-4 py-2 rounded ${formData.code && formData.name 
                ? 'bg-brand-cyan text-white hover:bg-brand-teal' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              disabled={!formData.code || !formData.name}
            >
              追加
            </button>
          </div>
        </div>
      )}
      
      {/* 組織削除確認モーダル */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-brand-darkBlue">組織の削除</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-brand-darkBlue hover:text-brand-teal">
                ✕
              </button>
            </div>
            <div className="mb-6">
              <p className="text-brand-darkBlue mb-2">
                この組織を削除してよろしいですか？
              </p>
              <p className="text-brand-coral mb-2 font-bold">
                {orgToDelete?.name} (コード: {orgToDelete?.code})
              </p>
              {orgToDelete?.children && orgToDelete.children.length > 0 && (
                <p className="text-brand-coral text-sm">
                  警告: 子組織も全て削除されます
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="border border-brand-darkBlue text-brand-darkBlue px-4 py-2 rounded w-full hover:bg-brand-lightGray"
              >
                キャンセル
              </button>
              <button 
                onClick={handleDeleteOrg}
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
};

export default OrganizationStructureRegisterPage;