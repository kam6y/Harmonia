import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChallengeList = ({ 
  challenges: initialChallenges = [], 
  categories = [],
  tenant_id: propTenantId,
  department_id: propDepartmentId
}) => {
  // 状態管理
  const [challenges, setChallenges] = useState(initialChallenges || []);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [challengeText, setChallengeText] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [deletingChallenge, setDeletingChallenge] = useState(null);
  const [filteredCategory, setFilteredCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" }); // typeはsuccess, errorのいずれか
  const [tenantId, setTenantId] = useState(null);
  const [departmentId, setDepartmentId] = useState(null);

  // テナントIDと部署IDの初期化（プロップから取得できない場合にローカルストレージから取得）
  useEffect(() => {
    // プロップから取得を試みる
    let tId = propTenantId;
    let dId = propDepartmentId;
    
    // プロップから取得できない場合、ローカルストレージから取得
    if (!tId && typeof window !== 'undefined') {
      tId = localStorage.getItem('tenant_id');
    }
    
    // URLからdepartmentIdを取得
    if (!dId && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      dId = urlParams.get('departmentId');
    }
    
    // それでも取得できない場合は、URLのパス部分から抽出を試みる
    if (!dId && typeof window !== 'undefined') {
      const pathMatch = window.location.pathname.match(/\/(\d+)/);
      if (pathMatch && pathMatch[1]) {
        dId = pathMatch[1];
      }
    }
    
    setTenantId(tId);
    setDepartmentId(dId);
  }, [propTenantId, propDepartmentId]);

  // 初期化処理
  useEffect(() => {
    // 初期状態を外部から受け取った値で更新
    setChallenges(initialChallenges || []);
  }, [initialChallenges]);

  // ステータスメッセージのリセット
  useEffect(() => {
    if (statusMessage.text) {
      const timer = setTimeout(() => {
        setStatusMessage({ text: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // 編集モーダルを表示（施策数が0の課題のみ可能）
  const handleEdit = (challenge) => {
    // 施策数のチェック（安全対策として二重チェック）
    if (challenge.measureCount && challenge.measureCount > 0) {
      setStatusMessage({
        text: "施策が登録されている課題は編集できません",
        type: "error"
      });
      return;
    }
    
    setStatusMessage({ text: "", type: "" });
    setEditingChallenge(challenge);
    setShowEditModal(true);
  };

  // 削除モーダルを表示
  const handleDelete = (challenge) => {
    setStatusMessage({ text: "", type: "" });
    setDeletingChallenge(challenge);
    setShowDeleteModal(true);
  };

  // テナントIDと部署IDの有効性をチェック
  const validateIds = () => {
    if (!tenantId || !departmentId) {
      setStatusMessage({ 
        text: "テナントIDまたは部署IDが見つかりません。再ログインしてください。", 
        type: "error" 
      });
      return false;
    }
    return true;
  };

  // 新規課題を登録（API連携）
  const handleRegister = async () => {
    // 入力チェック
    if (!selectedCategory || !challengeText) {
      setStatusMessage({ 
        text: "カテゴリーと課題内容を入力してください", 
        type: "error" 
      });
      return;
    }
    
    // 選択されたカテゴリー名を取得
    const categoryObj = categories && categories.find(cat => cat.id === selectedCategory);
    const categoryName = categoryObj ? categoryObj.name : "";
    
    if (!categoryName) {
      setStatusMessage({ 
        text: "有効なカテゴリーを選択してください", 
        type: "error" 
      });
      return;
    }

    // テナントIDと部署IDの検証
    if (!validateIds()) return;

    setIsSubmitting(true);
    
    try {
      // API へ新規登録リクエストを送信（ハードコーディングURL）
      // tenant_idとdepartment_idを明示的に整数変換
      const response = await axios.post('http://localhost/api/manager/challenges', {
        issue_category: categoryName,
        issue_text: challengeText,
        tenant_id: parseInt(tenantId, 10),
        department_id: parseInt(departmentId, 10),
      });
      
      if (response.data.success) {
        const newChallenge = response.data.challenge;
        
        // 新規登録後、state を更新
        setChallenges(prev => [
          ...prev, 
          {
            id: newChallenge.id,
            category: newChallenge.issue_category,
            challenge: newChallenge.issue_text,
            measureCount: 0, // 新規登録時は施策数0
          }
        ]);
        
        // 入力フィールドをリセット
        setSelectedCategory("");
        setChallengeText("");
        
        // 成功メッセージを表示
        setStatusMessage({ 
          text: `課題「${newChallenge.issue_text.substring(0, 20)}...」を登録しました`, 
          type: "success" 
        });
      } else {
        setStatusMessage({ 
          text: response.data.message || "課題登録に失敗しました", 
          type: "error" 
        });
      }
    } catch (error) {
      // エラー詳細を詳しく表示
      if (error.response && error.response.data) {
        // バリデーションエラーが返ってきた場合の処理
        if (error.response.status === 422 && error.response.data.errors) {
          const errorsObj = error.response.data.errors;
          const errorMessages = Object.keys(errorsObj)
            .map(key => `${key}: ${errorsObj[key].join(', ')}`)
            .join('\n');
          setStatusMessage({ 
            text: `入力内容に問題があります: ${errorMessages}`, 
            type: "error" 
          });
        } else {
          setStatusMessage({ 
            text: error.response.data.message || "課題登録中にエラーが発生しました", 
            type: "error" 
          });
        }
      } else {
        setStatusMessage({ 
          text: error.message || "課題登録中にエラーが発生しました", 
          type: "error" 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 編集を確定（API連携）
  const confirmEdit = async () => {
    if (!editingChallenge || !editingChallenge.category || !editingChallenge.challenge) {
      setStatusMessage({ 
        text: "カテゴリーと課題内容を入力してください", 
        type: "error" 
      });
      return;
    }

    // テナントIDと部署IDの検証
    if (!validateIds()) return;

    setIsSubmitting(true);

    try {
      const tenantIdInt = parseInt(tenantId, 10);
      const departmentIdInt = parseInt(departmentId, 10);
      
      // API に PUT リクエストで編集内容を送信（ハードコーディングURL）
      // tenant_idとdepartment_idを明示的に整数変換
      const response = await axios.put(`http://localhost/api/manager/challenges/${editingChallenge.id}`, {
        issue_category: editingChallenge.category,
        issue_text: editingChallenge.challenge,
        tenant_id: tenantIdInt,
        department_id: departmentIdInt,
      });

      if (response.data.success) {
        // API から返ってきた更新済みのデータで state を更新
        const updatedChallenge = response.data.challenge;
        setChallenges(prev => 
          prev.map(item => 
            item.id === editingChallenge.id ? {
              id: updatedChallenge.id,
              category: updatedChallenge.issue_category,
              challenge: updatedChallenge.issue_text,
              measureCount: item.measureCount || 0, // 既存の施策数を維持
            } : item
          )
        );
        
        setShowEditModal(false);
        setEditingChallenge(null);
        
        // 成功メッセージを表示
        setStatusMessage({ 
          text: "課題を更新しました", 
          type: "success" 
        });
      } else {
        setStatusMessage({ 
          text: response.data.message || "課題更新に失敗しました", 
          type: "error" 
        });
      }
    } catch (error) {
      // エラー詳細を詳しく表示
      if (error.response && error.response.data) {
        // バリデーションエラーが返ってきた場合の処理
        if (error.response.status === 422 && error.response.data.errors) {
          const errorsObj = error.response.data.errors;
          const errorMessages = Object.keys(errorsObj)
            .map(key => `${key}: ${errorsObj[key].join(', ')}`)
            .join('\n');
          setStatusMessage({ 
            text: `入力内容に問題があります: ${errorMessages}`, 
            type: "error" 
          });
        } else {
          setStatusMessage({ 
            text: error.response.data.message || "課題更新中にエラーが発生しました", 
            type: "error" 
          });
        }
      } else {
        setStatusMessage({ 
          text: error.message || "課題更新中にエラーが発生しました", 
          type: "error" 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 削除を確定（API連携）
  const confirmDelete = async () => {
    if (!deletingChallenge) return;
    
    // テナントIDと部署IDの検証
    if (!validateIds()) return;
    
    setIsSubmitting(true);
    
    try {
      // API に DELETE リクエストを送信（ハードコーディングURL）
      // 削除の場合はクエリパラメータとしてテナントIDと部署IDを追加
      const response = await axios.delete(`http://localhost/api/manager/challenges/${deletingChallenge.id}`, {
        params: {
          tenant_id: parseInt(tenantId, 10),
          department_id: parseInt(departmentId, 10)
        }
      });
      
      if (response.data.success) {
        setChallenges(prev => 
          prev.filter(item => item.id !== deletingChallenge.id)
        );
        setShowDeleteModal(false);
        setDeletingChallenge(null);
        
        // 成功メッセージを表示
        setStatusMessage({ 
          text: "課題を削除しました", 
          type: "success" 
        });
      } else {
        setStatusMessage({ 
          text: response.data.message || "課題削除に失敗しました", 
          type: "error" 
        });
      }
    } catch (error) {
      // エラー詳細を詳しく表示
      if (error.response && error.response.data) {
        setStatusMessage({ 
          text: error.response.data.message || "課題削除中にエラーが発生しました", 
          type: "error" 
        });
      } else {
        setStatusMessage({ 
          text: error.message || "課題削除中にエラーが発生しました", 
          type: "error" 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 安全なデータにアクセス
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeChallenges = Array.isArray(challenges) ? challenges : [];

  // フィルタリングされた課題リスト
  const filteredChallenges = filteredCategory 
    ? safeChallenges.filter(item => item.category === filteredCategory)
    : safeChallenges;

  return (
    <div className='m-4'>
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">課題一覧・新規登録</h3>
        <div className="relative group">
          <div className="text-brand-cyan hover:text-brand-teal flex items-center cursor-help">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>課題登録について</span>
          </div>
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg p-4 z-10 hidden group-hover:block border border-gray-200">
            <h4 className="font-semibold text-brand-darkBlue mb-2">課題登録の流れ</h4>
            <ol className="list-decimal pl-5 text-sm text-gray-700">
              <li className="mb-1">組織全体のスコア、マトリクス、ヒートマップを確認</li>
              <li className="mb-1">個別組織のデータの経時変化を閲覧・分析し、課題のあるカテゴリーを特定</li>
              <li className="mb-1">カテゴリーについて考えられる課題を登録</li>
              <li className="mb-1">課題の修正は、編集ボタンから可能です</li>
            </ol>
            <div className="flex items-center mt-2 text-sm text-brand-teal">
              <svg className="w-5 h-5 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>登録した課題に対して施策を登録しましょう！（改善タブへ移行してください）</span>
            </div>
          </div>
        </div>
      </div>

      {/* ステータスメッセージ */}
      {statusMessage.text && (
        <div className={`my-3 p-3 rounded ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {statusMessage.text}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-4 mt-4">
        {/* 新規課題登録フォーム */}
        <div className="flex items-center mb-3">
          <svg className="w-5 h-5 mr-2 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h4 className="font-bold text-gray-800">新規課題登録</h4>
        </div>
        <div className="bg-brand-lightGray p-4 rounded-lg border-l-4 border-brand-orange mb-6">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリー</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full text-gray-700"
                disabled={isSubmitting}
              >
                <option value="">選択してください</option>
                {safeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">課題内容</label>
              <input
                type="text"
                value={challengeText}
                onChange={(e) => setChallengeText(e.target.value)}
                placeholder="課題の詳細を入力してください"
                className="border border-gray-300 rounded px-3 py-2 w-full text-gray-700"
                disabled={isSubmitting}
              />
            </div>
            <div className="col-span-2 flex items-end">
              <button
                onClick={handleRegister}
                className={`${isSubmitting ? 'bg-gray-400' : 'bg-brand-orange hover:bg-orange-500'} text-white px-6 py-2 rounded text-sm w-full`}
                disabled={isSubmitting}
              >
                {isSubmitting ? '処理中...' : '登録する'}
              </button>
            </div>
          </div>
        </div>
        
        {/* 課題一覧 */}
        <h4 className="font-bold text-gray-800 mb-3 mt-8 border-t pt-6">登録済み課題一覧</h4>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <label className="mr-2 text-sm font-medium text-gray-700">カテゴリーでフィルタ:</label>
            <select
              value={filteredCategory}
              onChange={(e) => setFilteredCategory(e.target.value)}
              className="border text-black border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="">すべて表示</option>
              {safeCategories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <span className="text-sm text-gray-600">
            全{safeChallenges.length}件中 {filteredChallenges.length}件表示
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-brand-teal text-white">
                <th className="px-6 py-3 text-left w-1/4">カテゴリー</th>
                <th className="px-6 py-3 text-left w-1/2">課題</th>
                <th className="px-6 py-3 text-center w-1/12">施策数</th>
                <th className="px-6 py-3 text-center w-1/6">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredChallenges.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-700">
                    <div className="flex items-center">
                      <span>{item.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">{item.challenge}</td>
                  <td className="px-6 py-3 text-sm text-center text-gray-700">{item.measureCount}</td>
                  <td className="px-6 py-3 text-sm flex justify-center space-x-2">
                    {/* 施策数が0の場合のみ編集ボタンを有効化 */}
                    {item.measureCount === 0 ? (
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-brand-cyan hover:bg-brand-teal text-white px-4 py-1 rounded text-sm"
                        disabled={isSubmitting}
                      >
                        編集
                      </button>
                    ) : (
                      <div className="group relative">
                        <button
                          className="bg-gray-400 text-white px-4 py-1 rounded text-sm cursor-not-allowed"
                          disabled={true}
                        >
                          編集不可
                        </button>
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs rounded p-2">
                          施策が登録されている課題は編集できません
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(item)}
                      className="text-red-500 hover:text-red-700 px-4 py-1 rounded text-sm"
                      disabled={isSubmitting}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredChallenges.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
            <p>表示できる課題がありません。新しい課題を登録してください。</p>
          </div>
        )}
      </div>

      {/* 編集モーダル */}
      {showEditModal && editingChallenge && (
        <div className="fixed inset-0 text-black bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-1/2 p-6">
            <h3 className="text-lg font-semibold mb-4">課題を編集</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">カテゴリー</label>
              <select
                value={safeCategories.find(cat => cat.name === editingChallenge.category)?.id || ""}
                onChange={(e) => {
                  const categoryObj = safeCategories.find(cat => cat.id === e.target.value);
                  setEditingChallenge({
                    ...editingChallenge,
                    category: categoryObj ? categoryObj.name : ""
                  });
                }}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                disabled={isSubmitting}
              >
                <option value="">選択してください</option>
                {safeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">課題内容</label>
              <input
                type="text"
                value={editingChallenge.challenge || ""}
                onChange={(e) => setEditingChallenge({
                  ...editingChallenge,
                  challenge: e.target.value
                })}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                disabled={isSubmitting}
              >
                キャンセル
              </button>
              <button
                onClick={confirmEdit}
                className={`px-4 py-2 ${isSubmitting ? 'bg-gray-400' : 'bg-brand-teal hover:bg-brand-darkBlue'} text-white rounded`}
                disabled={isSubmitting}
              >
                {isSubmitting ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {showDeleteModal && deletingChallenge && (
        <div className="fixed inset-0 text-black bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-1/3 p-6">
            <h3 className="text-lg font-semibold mb-4">課題を削除</h3>
            
            <p className="mb-6">
              以下の課題を削除してもよろしいですか？
              <br />
              <span className="font-semibold">{deletingChallenge.challenge}</span>
            </p>
            
            {deletingChallenge.measureCount > 0 && (
              <div className="mb-4 p-2 bg-red-50 text-red-600 rounded">
                <p className="text-sm">
                  この課題には{deletingChallenge.measureCount}件の施策が登録されています。
                  削除すると、関連する施策も全て削除されます。
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                disabled={isSubmitting}
              >
                キャンセル
              </button>
              <button
                onClick={confirmDelete}
                className={`px-4 py-2 ${isSubmitting ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'} text-white rounded`}
                disabled={isSubmitting}
              >
                {isSubmitting ? '削除中...' : '削除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeList;