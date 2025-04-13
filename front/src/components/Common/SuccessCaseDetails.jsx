// front/src/components/common/SuccessCaseDetails.jsx
import React from 'react';

const SuccessCaseDetails = ({ caseData, onClose }) => {
  if (!caseData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-brand-darkBlue">{caseData.title}</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">課題カテゴリ</p>
              <p className="font-medium">{caseData.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">課題</p>
              <p className="font-medium">{caseData.issue}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">担当部署</p>
              <p className="font-medium">{caseData.department}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">担当者</p>
              <p className="font-medium">{caseData.manager}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-brand-darkBlue mb-2">施策概要</h3>
            <p className="mb-4">
              {caseData.description || `${caseData.department}が抱えていた「${caseData.issue}」という課題に対して、${caseData.title}を実施。効果的な解決策として評価されました。`}
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-brand-darkBlue mb-2">成功ポイント</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>関係者との事前の丁寧なコミュニケーション</li>
              <li>明確なゴール設定と進捗管理</li>
              <li>定期的なフィードバックの収集と改善</li>
              <li>トップダウンとボトムアップの両方からのアプローチ</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-brand-darkBlue mb-2">得られた効果</h3>
            <div className="bg-brand-lightGray p-4 rounded-md">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 rounded-full bg-brand-teal mr-2"></div>
                <p className="font-medium">生産性向上: 約25%</p>
              </div>
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 rounded-full bg-brand-cyan mr-2"></div>
                <p className="font-medium">社員満足度: 15ポイント上昇</p>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-brand-coral mr-2"></div>
                <p className="font-medium">コスト削減: 年間約200万円</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-brand-darkBlue mb-2">参考資料・コンタクト</h3>
            <p className="mb-1">詳細資料: <a href="#" className="text-brand-teal hover:underline">施策資料.pdf</a></p>
            <p className="mb-1">担当者連絡先: <span className="text-brand-darkBlue">{caseData.manager}@example.com</span></p>
            <p>相談可能時間: 平日 13:00-17:00</p>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-brand-lightGray border-t border-gray-200 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-brand-teal text-white rounded-md hover:bg-opacity-90"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessCaseDetails;