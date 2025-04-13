// front/src/pages/personnel/organization_members.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PersonnelHeader from "@/components/personnel/PersonnelHeader";
import PersonnelSubHeader from "@/components/common/SubHeader";
import MemberTabs from "@/components/personnel/MemberTabs";
import OrganizationMembersService from '@/services/OrganizationMembersService';

const OrganizationMembersPage = () => {
  const router = useRouter();
  const { tab = 'manager' } = router.query;
  
  // ★ localStorage から tenant_id を取得（なければ1を使う）
  const [tenantId, setTenantId] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTenantId = localStorage.getItem("tenant_id");
      return storedTenantId ? JSON.parse(storedTenantId) : 1;
    }
    return 1;
  });
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ページネーション用の状態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    // ページ切り替え時に常に1ページ目に戻す
    if (router.isReady && tab !== router.query.tab) {
      setCurrentPage(1);
    }
  }, [router.isReady, tab, router.query.tab]);

  useEffect(() => {
    // ページ切り替え時にデータを読み込む
    if (router.isReady) {
      fetchMembers();
    }
  }, [router.isReady, tab, currentPage, itemsPerPage]);

  // メンバーデータの取得
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await OrganizationMembersService.getMembers(
        tenantId, // テナントID（localStorage から取得）
        tab, // 'manager' または 'employee'
        currentPage,
        itemsPerPage
      );
      
      if (response.success) {
        setMembers(response.members);
        setTotalPages(response.total_pages);
        setTotalItems(response.total);
      } else {
        setError('データの取得に失敗しました');
      }
    } catch (error) {
      console.error('メンバー取得エラー:', error);
      setError('データの取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 表示件数を変更する関数
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // 表示件数変更時は1ページ目に戻す
  };

  // ページを変更する関数
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEdit = () => {
    router.push('/personnel/organization_members_edit?tab=' + tab);
  };

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
        {/* メンバーリスト（カード風） */}
        <div className="bg-white rounded-lg shadow-sm p-6 min-h-[calc(100vh-240px)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-brand-darkBlue">
              {tab === 'manager' ? '管理職一覧' : '従業員一覧'}
            </h2>
            <button
              onClick={handleEdit}
              className="bg-brand-cyan text-white px-4 py-2 rounded hover:bg-brand-teal"
            >
              編集
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              読み込み中...
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 text-red-500">
              {error}
              <button 
                onClick={fetchMembers} 
                className="ml-2 underline text-brand-cyan hover:text-brand-teal"
              >
                再試行
              </button>
            </div>
          ) : members.length > 0 ? (
            <>
              {/* 表示件数選択 */}
              <div className="flex justify-end mb-4">
                <div className="flex text-black items-center text-sm">
                  <span className="mr-2">表示件数:</span>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="border rounded p-1"
                  >
                    <option value={10}>10件</option>
                    <option value={20}>20件</option>
                    <option value={40}>40件</option>
                  </select>
                </div>
              </div>

              {/* テーブル */}
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      {tab === 'manager' && (
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          役職
                        </th>
                      )}
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        メールアドレス
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        権限
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        所属組織
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        準所属組織
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        {tab === 'manager' && (
                          <td className="py-2 px-4 text-sm text-gray-900">
                            {member.role}
                          </td>
                        )}
                        <td className="py-2 px-4 text-sm text-gray-900">
                          {member.email}
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-900">
                          {member.permission}
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-900">
                          {member.org_code} {member.org_name && `(${member.org_name})`}
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-900">
                          {member.sub_org_code} {member.sub_org_name && `(${member.sub_org_name})`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ページネーション */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex items-center space-x-1">
                    {/* 前へボタン */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-brand-darkBlue hover:bg-brand-lightGray'
                      }`}
                    >
                      前へ
                    </button>

                    {/* ページ番号 */}
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const pageNumber = index + 1;
                      // 現在のページの前後2ページずつと最初・最後のページを表示
                      const shouldShowPage =
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        Math.abs(pageNumber - currentPage) <= 2;

                      // 省略記号の表示条件
                      const showEllipsisBefore =
                        index === 1 && currentPage > 4;
                      const showEllipsisAfter =
                        index === totalPages - 2 && currentPage < totalPages - 3;

                      if (showEllipsisBefore) {
                        return <span key={`ellipsis-before`}>...</span>;
                      }

                      if (showEllipsisAfter) {
                        return <span key={`ellipsis-after`}>...</span>;
                      }

                      if (shouldShowPage) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-3 py-1 rounded ${
                              currentPage === pageNumber
                                ? 'bg-brand-darkBlue text-white'
                                : 'text-brand-darkBlue hover:bg-brand-lightGray'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }

                      return null;
                    })}

                    {/* 次へボタン */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-brand-darkBlue hover:bg-brand-lightGray'
                      }`}
                    >
                      次へ
                    </button>
                  </div>
                </div>
              )}

              {/* 表示件数情報 */}
              <div className="mt-4 text-sm text-gray-600 text-center">
                全{totalItems}件中 {(currentPage - 1) * itemsPerPage + 1}～
                {Math.min(currentPage * itemsPerPage, totalItems)}件表示
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">
              {tab === 'manager' ? '管理職がいません' : '従業員がいません'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationMembersPage;