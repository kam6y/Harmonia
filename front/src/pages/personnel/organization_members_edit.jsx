// front/src/pages/personnel/organization_members_edit.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PersonnelHeader from "@/components/personnel/PersonnelHeader";
import PersonnelSubHeader from "@/components/common/SubHeader";
import MemberTabs from "@/components/personnel/MemberTabs";
import OrganizationMembersService from '@/services/OrganizationMembersService';

const OrganizationMembersEditPage = () => {
  const router = useRouter();
  const { tab = 'employee' } = router.query;
  
  // ★ localStorage から tenant_id を取得（なければ1を使う）
  const [tenantId, setTenantId] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTenantId = localStorage.getItem("tenant_id");
      return storedTenantId ? JSON.parse(storedTenantId) : 1;
    }
    return 1;
  });
  
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvError, setCsvError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // タブが変更されたときにデータをリロード
    if (router.isReady) {
      fetchMembers();
      fetchOrganizations();
    }
  }, [router.isReady, tab]);

  // 検索機能のためのフィルタリング
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMembers(members);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = members.filter(member => {
        const matchesEmail = (member.email || '').toLowerCase().includes(term);
        const matchesOrgCode = (member.orgCode || '').toString().toLowerCase().includes(term);
        const matchesRole = tab === 'manager' ? 
          (member.role || '').toLowerCase().includes(term) : false;
        
        return matchesEmail || matchesOrgCode || matchesRole;
      });
      setFilteredMembers(filtered);
    }
  }, [searchTerm, members, tab]);

  // 組織リストの取得
  const fetchOrganizations = async () => {
    try {
      setLoadingOrgs(true);
      // テナントIDを渡して組織情報を取得
      const response = await OrganizationMembersService.getOrganizationOptions(tenantId);
      if (response.success) {
        setOrganizations(response.organizations);
      }
    } catch (error) {
      console.error('組織データの取得に失敗しました:', error);
    } finally {
      setLoadingOrgs(false);
    }
  };

  // メンバーリストの取得（全件取得）
  const fetchMembers = async () => {
    try {
      setLoading(true);
      // 全件取得のために大きなページサイズを指定（または専用のAPI）
      const response = await OrganizationMembersService.getMembers(
        tenantId, // テナントID（localStorage から取得）
        tab, // 'manager' または 'employee'
        1, // ページ番号
        10000 // 大きなページサイズで実質全件取得
      );
      
      if (response.success) {
        // バックエンドからのレスポンスをフロントエンド形式に変換
        const formattedMembers = response.members.map(member => ({
          id: member.id,
          email: member.email,
          permission: member.permission,
          orgCode: member.org_code,
          subOrgCode: member.sub_org_code || '',
          // 管理職の場合は役職名も設定
          ...(tab === 'manager' ? { role: member.role || '' } : {})
        }));
        
        // 新しいメンバー用の空行を追加
        formattedMembers.push(createEmptyMember());
        
        setMembers(formattedMembers);
        setFilteredMembers(formattedMembers);
      }
    } catch (error) {
      console.error('メンバー取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 空のメンバーオブジェクトを作成
  const createEmptyMember = () => {
    const base = { 
      id: Date.now(), 
      email: '', 
      permission: '一般', 
      orgCode: '', 
      subOrgCode: '' 
    };
    
    return tab === 'manager' ? { ...base, role: '' } : base;
  };

  const addMember = () => {
    const newMember = createEmptyMember();
    setMembers([...members, newMember]);
    setFilteredMembers([...filteredMembers, newMember]);
  };

  const updateMember = (id, field, value) => {
    const updatedMembers = members.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    );
    
    setMembers(updatedMembers);
    
    // 検索状態を維持してフィルタリング
    if (searchTerm.trim() === '') {
      setFilteredMembers(updatedMembers);
    } else {
      applyFilter(updatedMembers, searchTerm);
    }
    
    // 最後の行に入力があった場合、新しい空行を追加
    const lastMember = updatedMembers[updatedMembers.length - 1];
    if (lastMember.id === id && (field === 'email' || field === 'role') && value.trim() !== '') {
      const hasEmptyRow = updatedMembers.some(m => m.email === '');
      if (!hasEmptyRow) {
        const newMember = createEmptyMember();
        setMembers([...updatedMembers, newMember]);
        
        // 検索中でなければフィルタリング結果にも追加
        if (searchTerm.trim() === '') {
          setFilteredMembers([...updatedMembers, newMember]);
        }
      }
    }
  };

  // 検索フィルタを適用
  const applyFilter = (membersArray, term) => {
    if (!term.trim()) {
      setFilteredMembers(membersArray);
      return;
    }
    
    const lowerTerm = term.toLowerCase();
    const filtered = membersArray.filter(member => {
      const matchesEmail = (member.email || '').toLowerCase().includes(lowerTerm);
      const matchesOrgCode = (member.orgCode || '').toString().toLowerCase().includes(lowerTerm);
      const matchesRole = tab === 'manager' ? 
        (member.role || '').toLowerCase().includes(lowerTerm) : false;
      
      return matchesEmail || matchesOrgCode || matchesRole;
    });
    
    setFilteredMembers(filtered);
  };

  // 検索ハンドラ
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  // 検索をクリア
  const clearSearch = () => {
    setSearchTerm('');
    setFilteredMembers(members);
  };

  const deleteMember = (id) => {
    const updatedMembers = members.filter(member => member.id !== id);
    setMembers(updatedMembers);
    
    // 検索状態を維持
    if (searchTerm.trim() === '') {
      setFilteredMembers(updatedMembers);
    } else {
      applyFilter(updatedMembers, searchTerm);
    }
  };

  const handleCancel = () => {
    router.push('/personnel/organization_members?tab=' + tab);
  };

  const validateMembers = () => {
    let isValid = true;
    let errors = [];
    
    for (const member of members) {
      // 最後の空行はスキップ
      if (member.email === '') continue;
      
      if (!member.email.includes('@')) {
        errors.push(`メールアドレス「${member.email}」が不正です`);
        isValid = false;
      }
      
      if (!member.orgCode) {
        errors.push(`「${member.email}」の所属組織コードが選択されていません`);
        isValid = false;
      }
      
      if (tab === 'manager' && !member.role) {
        errors.push(`「${member.email}」の役職名が入力されていません`);
        isValid = false;
      }
    }
    
    if (!isValid) {
      alert(`入力エラーがあります：\n${errors.join('\n')}`);
    }
    
    return isValid;
  };

  const handleSave = async () => {
    if (!validateMembers()) return;
    
    try {
      setLoading(true);
      
      // 空の行を除外
      const membersToSave = members.filter(member => member.email.trim() !== '');
      
      const response = await OrganizationMembersService.saveMembers(tenantId, membersToSave);
      
      if (response.success) {
        alert('メンバー情報を保存しました');
        router.push('/personnel/organization_members?tab=' + tab);
      } else {
        alert('保存に失敗しました: ' + response.message);
      }
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = () => {
    setShowCSVModal(true);
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
    setCsvError('');
  };

  const processCSV = async () => {
    if (!csvFile) {
      setCsvError('ファイルを選択してください');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await OrganizationMembersService.importMembersFromCsv(tenantId, csvFile, tab);
      
      if (response.success) {
        alert('CSVファイルからメンバーをインポートしました');
        setShowCSVModal(false);
        await fetchMembers(); // メンバーリストを再取得
      } else {
        setCsvError('インポートに失敗しました: ' + response.message);
      }
    } catch (error) {
      console.error('CSVインポートエラー:', error);
      setCsvError('インポート処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading && members.length === 0) {
    return (
      <div className="flex flex-col h-screen">
        <PersonnelHeader />
        <PersonnelSubHeader title="組織メンバー" />
        <MemberTabs activeTab={tab} />
        <div className="flex-1 flex justify-center items-center bg-brand-lightGray">
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <PersonnelHeader />

      {/* サブヘッダー */}
      <PersonnelSubHeader title="組織メンバー" />

      {/* タブ */}
      <MemberTabs activeTab={tab} />

      {/* 全体のコンテナ（背景グレー） */}
      <div className="flex-1 bg-brand-lightGray p-6 overflow-auto">
        {/* コントロールバー */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={handleCancel} 
              className="flex items-center text-brand-darkBlue hover:text-brand-teal"
            >
              <span className="mr-2">←</span> 編集をやめる
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleCSVUpload}
              className="border border-brand-cyan text-brand-cyan px-4 py-2 rounded hover:bg-brand-lightGray"
              disabled={loading}
            >
              CSVで{tab === 'manager' ? '管理職' : '従業員'}を追加
            </button>
            <button 
              onClick={handleSave}
              className="bg-brand-cyan text-white px-4 py-2 rounded hover:bg-brand-teal"
              disabled={loading}
            >
              保存
            </button>
          </div>
        </div>

        {/* 検索バー */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="メールアドレス、組織コード、役職名で検索..."
              className="border text-black rounded-l p-2 w-full text-sm"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="bg-gray-200 px-3 py-2 rounded-r text-gray-600 hover:bg-gray-300"
              >
                ✕
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-gray-600">
              検索結果: {filteredMembers.length - (filteredMembers[filteredMembers.length - 1]?.email === '' ? 1 : 0)} 件
            </div>
          )}
        </div>

        {/* メンバーフォーム */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className={`grid ${tab === 'manager' ? 'grid-cols-5' : 'grid-cols-4'} gap-4 mb-4 text-sm font-medium text-gray-700`}>
            {tab === 'manager' && <div>役職名</div>}
            <div>メールアドレス</div>
            <div>権限</div>
            <div>所属組織コード</div>
            <div className="flex-1">準所属組織コード</div>
          </div>

          {filteredMembers.map((member, index) => (
            <div key={member.id} className={`grid ${tab === 'manager' ? 'grid-cols-5' : 'grid-cols-4'} gap-4 mb-4 items-center`}>
              {tab === 'manager' && (
                <input
                  type="text"
                  value={member.role || ''}
                  onChange={(e) => updateMember(member.id, 'role', e.target.value)}
                  placeholder="例: 営業部長"
                  className="border text-black rounded p-2 w-full text-sm"
                />
              )}
              <input
                type="email"
                value={member.email || ''}
                onChange={(e) => updateMember(member.id, 'email', e.target.value)}
                placeholder="例: employee@example.com"
                className="border text-black rounded p-2 w-full text-sm"
              />
              <select
                value={member.permission || '一般'}
                onChange={(e) => updateMember(member.id, 'permission', e.target.value)}
                className="border text-black rounded p-2 w-full text-sm appearance-none"
              >
                <option value="人事">人事</option>
                <option value="一般">一般</option>
              </select>
              <select
                value={member.orgCode || ''}
                onChange={(e) => updateMember(member.id, 'orgCode', e.target.value)}
                className="border text-black rounded p-2 w-full text-sm appearance-none"
              >
                <option value="">選択してください</option>
                {organizations.map(org => (
                  <option key={org.code} value={org.code}>
                    {org.code} ({org.name})
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between">
                <select
                  value={member.subOrgCode || ''}
                  onChange={(e) => updateMember(member.id, 'subOrgCode', e.target.value)}
                  className="border text-black rounded p-2 w-full text-sm appearance-none"
                >
                  <option value="">選択してください</option>
                  {organizations.map(org => (
                    <option key={org.code} value={org.code}>
                      {org.code} ({org.name})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => deleteMember(member.id)}
                  className="text-red-500 hover:text-red-700 ml-2 px-3 whitespace-nowrap"
                  disabled={member.email === '' && index === filteredMembers.length - 1}
                >
                  削除
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addMember}
            className="text-brand-cyan border border-brand-cyan px-4 py-2 rounded hover:bg-brand-lightGray mt-4 text-sm"
          >
            {tab === 'manager' ? '管理職を追加' : '従業員を追加'}
          </button>
        </div>
      </div>

      {/* CSV アップロードモーダル */}
      {showCSVModal && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-brand-darkBlue">CSVで{tab === 'manager' ? '管理職' : '従業員'}を追加</h3>
              <button onClick={() => setShowCSVModal(false)} className="text-brand-darkBlue hover:text-brand-teal">
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                以下のカラムを含むCSVファイルをアップロードしてください：
              </p>
              <ul className="text-xs text-gray-600 list-disc pl-5 mb-4">
                {tab === 'manager' && <li>role (役職名) - 必須</li>}
                <li>email (メールアドレス) - 必須</li>
                <li>permission (権限) - 必須</li>
                <li>organization_code (所属組織コード) - 必須</li>
                <li>sub_organization_code (準所属組織コード) - 省略可</li>
                <li>name (氏名) - 省略可</li>
              </ul>
              <p className="text-xs text-gray-600 mb-2">
                ※ 準所属組織コードは空白でも問題ありません。
              </p>
              
              <div className="mt-4">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-brand-lightGray file:text-brand-darkBlue
                  hover:file:bg-gray-200"
                />
              </div>
              
              {csvError && (
                <div className="mt-2 text-red-500 text-xs">
                  {csvError}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setShowCSVModal(false)}
                className="border border-brand-darkBlue text-brand-darkBlue px-4 py-2 rounded w-full hover:bg-brand-lightGray"
                disabled={loading}
              >
                キャンセル
              </button>
              <button 
                onClick={processCSV}
                className="bg-brand-cyan text-white px-4 py-2 rounded w-full hover:bg-brand-teal"
                disabled={loading}
              >
                {loading ? 'アップロード中...' : 'アップロード'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationMembersEditPage;