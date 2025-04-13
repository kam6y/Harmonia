import React from 'react';

const OrganizationSelector = ({
                                selectedOrganization,  // 親コンポーネントから現在の選択状態を受け取る
                                onSelectOrganization,
                                organizations = [] // デフォルト値を空配列に
                              }) => {
  // 組織を選択したときのハンドラー
  const handleSelectOrg = (orgId) => {
    if (onSelectOrganization) {
      onSelectOrganization(orgId);
    }
  };

  return (
      <div className="mt-24 mb-6 pt-2 pl-4 bg-white">
        {/* 組織切り替えタブ */}
        <div className="flex border-b">
          {organizations.map(org => (
              <button
                  key={org.id}
                  onClick={() => handleSelectOrg(org.id)}
                  className={`py-2 px-6 font-medium relative ${
                      selectedOrganization === org.id
                          ? 'text-brand-coral'
                          : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {org.name}
                {selectedOrganization === org.id && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-coral"></span>
                )}
              </button>
          ))}
        </div>
      </div>
  );
};

export default OrganizationSelector;
