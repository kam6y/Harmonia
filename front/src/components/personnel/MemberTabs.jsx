// front/src/components/common/MemberTabs.jsx
import React from 'react';
import Link from 'next/link';

const MemberTabs = ({ activeTab }) => {
  return (
    <div className="flex bg-white border-b pt-12">
      <Link 
        href="/personnel/organization_members?tab=manager"
        className={`py-3 px-6 ${activeTab === 'manager' ? 'text-brand-darkBlue border-b-2 border-brand-darkBlue' : 'text-gray-500'}`}
      >
        管理職
      </Link>
      <Link 
        href="/personnel/organization_members?tab=employee"
        className={`py-3 px-6 ${activeTab === 'employee' ? 'text-brand-darkBlue border-b-2 border-brand-darkBlue' : 'text-gray-500'}`}
      >
        従業員
      </Link>
    </div>
  );
};

export default MemberTabs;