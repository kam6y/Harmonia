// front/src/components/common/MeasureModal.jsx
import React, { useState, useEffect, useRef } from 'react';

const MeasureModal = ({ isOpen, onClose, measure, onUpdate }) => {
  if (!isOpen || !measure) return null;

  // 編集モードを管理するステート
  const [isEditing, setIsEditing] = useState(false);

  // 編集用データを保持するステート
  const [editData, setEditData] = useState({
    title: '',
    category: '',
    issue: '',
    department: '',
    manager: '',
    description: '',
    satisfaction: '',
    budget: '',
    deadline: '',
    status: '',
  });

  // コメント機能用のステート
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [mentionType, setMentionType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const menuRef = useRef(null);

  // measure が変更されたら編集データとコメントを更新
  useEffect(() => {
    if (measure) {
      setEditData({
        ...measure,
        description: measure.description || '',
      });
      setComments(measure.comments || []);
    }
  }, [measure]);

  // 施策詳細を取得する関数
  const fetchMeasureDetails = async () => {
    try {
      const response = await fetch(`http://localhost/api/measures/${measure.id}`);
      if (!response.ok) {
        throw new Error('施策データの取得に失敗しました');
      }
      
      const data = await response.json();
      // 施策データを更新
      setEditData({
        ...data,
        description: data.description || '',
      });
      // コメントを更新
      setComments(data.comments || []);
    } catch (error) {
      console.error('施策データ取得エラー:', error);
    }
  };

  // 自動生成される施策概要
  const getAutoDescription = () => {
    if (editData.description) return editData.description;
    return `${editData.department || ''}が抱えていた「${editData.issue || ''}」という課題に対して、${editData.title}を実施。効果的な解決策として評価されました。`;
  };

  // 入力項目の変更を処理する関数
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value,
    });
  };

  // 更新を保存する関数
  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost/api/measures/${measure.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        },
        body: JSON.stringify(editData)
      });
      
      if (!response.ok) {
        throw new Error('施策の更新に失敗しました');
      }
      
      await fetchMeasureDetails();
      
      if (onUpdate) {
        onUpdate(editData);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('施策更新エラー:', error);
      alert('施策の更新に失敗しました');
    }
  };

  // 編集をキャンセルする関数
  const handleCancel = () => {
    setEditData({
      ...measure,
      description: measure.description || '',
    });
    setIsEditing(false);
  };

  // メニュー外クリックでメニューを閉じる
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMentionMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  // コメント送信処理
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const commentData = {
        measure_id: measure.id,
        comment_text: newComment,
        mention_is_admin: true,
        mention_is_personnel: mentionType === 'personnel',
        mention_is_manager: mentionType === 'manager',
        staff_id: JSON.parse(localStorage.getItem("id") || "null")
      };
      
      // エンドポイントを measures/comments に修正
      const response = await fetch(`http://localhost/api/measure-comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData)
      });

      console.log(response)
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('APIエラーレスポンス:', response.status, errorText);
        throw new Error('コメントの保存に失敗しました');
      }
      
      // 送信成功後、最新の施策詳細を取得してコメントを更新
      await fetchMeasureDetails();
      setNewComment('');
      setMentionType(null);
    } catch (error) {
      console.error('コメント送信エラー:', error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // メンション選択処理
  const handleMentionSelect = (type) => {
    setMentionType(type === mentionType ? null : type);
    setShowMentionMenu(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-brand-lightGray">
          {isEditing ? (
            <input
              type="text"
              name="title"
              value={editData.title}
              onChange={handleChange}
              className="text-xl font-bold text-brand-darkBlue bg-white border border-gray-300 rounded-md p-1 w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
            />
          ) : (
            <h2 className="text-xl font-bold text-brand-darkBlue">
              {editData.title}
            </h2>
          )}
          <div className="flex items-center gap-3">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-brand-cyan hover:bg-brand-teal text-white rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                編集
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-brand-coral focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 左側：基本情報 */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-brand-teal">
                基本情報
              </h3>
              <div className="space-y-4">
                {/* ステータス */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ステータス
                  </label>
                  {isEditing ? (
                    <select
                      name="status"
                      value={editData.status}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    >
                      <option value="計画中">計画中</option>
                      <option value="実行中">実行中</option>
                      <option value="仕組み化">仕組み化</option>
                      <option value="アーカイブ">アーカイブ</option>
                    </select>
                  ) : (
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm ${
                        editData.status === '計画中'
                          ? 'bg-brand-cyan text-white'
                          : editData.status === '実行中'
                            ? 'bg-brand-teal text-white'
                            : editData.status === '仕組み化'
                              ? 'bg-brand-orange text-white'
                              : 'bg-brand-darkBlue text-white'
                      }`}
                    >
                      {editData.status}
                    </div>
                  )}
                </div>

                {/* カテゴリ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    カテゴリ
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="category"
                      value={editData.category}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    />
                  ) : (
                    <div className="px-3 py-1 rounded-md bg-brand-lightGray inline-block text-sm text-gray-800">
                      {editData.category}
                    </div>
                  )}
                </div>

                {/* 課題内容 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    課題内容
                  </label>
                  {isEditing ? (
                    <textarea
                      name="issue"
                      value={editData.issue}
                      onChange={handleChange}
                      rows="3"
                      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    />
                  ) : (
                    <p className="text-gray-800">{editData.issue}</p>
                  )}
                </div>

                {/* 担当部署 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    担当部署
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      value={editData.department}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    />
                  ) : (
                    <p className="text-gray-800">{editData.department}</p>
                  )}
                </div>

                {/* 担当者 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    担当者
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="manager"
                      value={editData.manager}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    />
                  ) : (
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-full bg-brand-teal bg-opacity-20 text-brand-teal flex items-center justify-center mr-2">
                        {editData.manager?.charAt(0) || '-'}
                      </span>
                      <span className="text-gray-800">
                        {editData.manager || '未設定'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 右側：詳細情報 */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-brand-teal">
                施策詳細
              </h3>
              <div className="space-y-4">
                {/* 施策概要 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    施策概要
                  </label>
                  {isEditing ? (
                      <textarea
                          name="description"
                          value={editData.description.replace(/\\n/g, "\n")}
                          onChange={handleChange}
                          rows="4"
                          placeholder="施策の詳細を入力してください。空の場合は自動的に生成されます。"
                          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      />
                  ) : (
                      <p
                          className="text-gray-800 p-3 bg-gray-50 rounded-md border border-gray-200 whitespace-pre-wrap"
                      >
                        {getAutoDescription().replace(/\\n/g, "\n")}
                      </p>
                  )}

                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* 社員満足度 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      目標満足度
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="satisfaction"
                        value={editData.satisfaction}
                        onChange={handleChange}
                        placeholder="+1.2"
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      />
                    ) : (
                      <div
                        className={`text-sm font-medium ${editData.satisfaction?.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {editData.satisfaction} ポイント
                      </div>
                    )}
                  </div>

                  {/* 目標期限 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      目標期限
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="deadline"
                        value={editData.deadline}
                        onChange={handleChange}
                        placeholder="2025年6月"
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      />
                    ) : (
                      <div className="text-sm text-gray-800">
                        {editData.deadline}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* アクションボタン（編集モード時のみ表示） */}
          {isEditing && (
            <div className="flex justify-end gap-3 mt-6 mb-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-brand-cyan hover:bg-brand-teal text-white rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                保存
              </button>
            </div>
          )}

          {/* コメント欄 */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-brand-teal">
              コメント
            </h3>

            <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <div className="flex justify-between mb-1">
                      <div className="font-medium text-brand-darkBlue">
                        {comment.author}
                      </div>
                      <div className="text-xs text-gray-500">
                        {comment.date}
                      </div>
                    </div>
                    <p className="text-gray-800">{comment.text}</p>
                    {(comment.mention_is_admin || comment.mention_is_personnel || comment.mention_is_manager) && (
                      <div className="mt-1 text-xs">
                        <span className="inline-flex items-center px-2 py-1 bg-brand-lightGray text-brand-darkBlue rounded-full">
                          {comment.mention_is_admin && (
                            <span className="flex items-center text-brand-teal">
                              管理者向け
                            </span>
                          )}
                          {comment.mention_is_personnel && (
                            <span className="flex items-center text-brand-cyan ml-1">
                              人事担当者向け
                            </span>
                          )}
                          {comment.mention_is_manager && (
                            <span className="flex items-center text-brand-orange ml-1">
                              管理職向け
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  コメントはまだありません
                </p>
              )}
            </div>

            {/* メンション機能付きコメントフォーム */}
            <form onSubmit={handleCommentSubmit} className="mt-4 bg-white p-4 rounded-lg shadow">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <img
                    src="/images/Generic_avatar.svg"
                    alt="ユーザーアバター"
                    className="w-10 h-10 rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      placeholder="コメントを入力..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    
                    {mentionType && (
                      <div className="mt-1 text-sm flex items-center">
                        {mentionType === 'admin' && (
                          <span className="text-brand-teal font-medium">管理者へメンション</span>
                        )}
                        {mentionType === 'personnel' && (
                          <span className="text-brand-cyan font-medium">人事担当者へメンション</span>
                        )}
                        {mentionType === 'manager' && (
                          <span className="text-brand-orange font-medium">管理職へメンション</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 flex justify-between">
                    <div className="relative" ref={menuRef}>
                      <button
                        type="button"
                        className="flex items-center text-sm text-gray-500 hover:text-brand-teal p-2 rounded border border-gray-200"
                        onClick={() => setShowMentionMenu(!showMentionMenu)}
                      >
                        メンション
                        {mentionType && `（${
                          mentionType === 'admin' ? '管理者' : 
                          mentionType === 'personnel' ? '人事' : '管理職'
                        }）`}
                      </button>
                      
                      {showMentionMenu && (
                        <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <ul>
                            <li
                              className={`px-3 py-2 hover:bg-gray-50 cursor-pointer ${mentionType === 'admin' ? 'bg-brand-lightGray text-brand-teal font-semibold' : ''}`}
                              onClick={() => handleMentionSelect('admin')}
                            >
                              管理者
                            </li>
                            <li
                              className={`px-3 py-2 hover:bg-gray-50 cursor-pointer ${mentionType === 'personnel' ? 'bg-brand-lightGray text-brand-cyan font-semibold' : ''}`}
                              onClick={() => handleMentionSelect('personnel')}
                            >
                              人事担当者
                            </li>
                            <li
                              className={`px-3 py-2 hover:bg-gray-50 cursor-pointer ${mentionType === 'manager' ? 'bg-brand-lightGray text-brand-orange font-semibold' : ''}`}
                              onClick={() => handleMentionSelect('manager')}
                            >
                              管理職
                            </li>
                            {mentionType && (
                              <li
                                className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-red-500"
                                onClick={() => setMentionType(null)}
                              >
                                クリア
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-brand-cyan disabled:opacity-50 flex items-center"
                      disabled={isSubmitting || !newComment.trim()}
                    >
                      {isSubmitting ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      ) : null}
                      送信
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeasureModal;