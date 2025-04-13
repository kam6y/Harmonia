// front/src/components/common/SuccessCaseHeader.jsx
import React from 'react';

const SuccessCaseHeader = () => {
  return (
    <div className="mb-6 mt-10">
      {/* ヘッダータイトル部分 */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold text-brand-darkBlue">施策の成功事例</h1>
      </div>

      {/* シンプルなメッセージボックス */}
      <div className="bg-white border-l-4 border-brand-teal rounded-md shadow-sm p-4 ">
        <div className="flex items-center">
          <img 
            src="/images/mascot.png" 
            alt="マスコットキャラクター" 
            className="w-16 h-16 mr-10"
          />
          
          <div className="flex-1">
            <h2 className="text-lg font-bold text-brand-darkBlue mb-1">
              他部署の成功事例から効果的な施策を
            </h2>
            <p className="text-sm text-gray-700">
              社内の成功事例を参考に、自部署の課題解決に活用しましょう。
              <span className="text-brand-teal font-medium ml-1">
                ベストプラクティスから学び、効果的な施策を素早く立案できます
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessCaseHeader;