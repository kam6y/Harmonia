// front/src/components/OrganizationChart.jsx
import React, { useState } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import styled from 'styled-components';

// スタイル付きのコンポーネント
const StyledNode = styled.div`
  padding: 12px;
  border-radius: 8px;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  display: inline-block;
  width: 176px;
  position: relative;
  margin: 0 auto;
`;

const StyledTreeNode = styled(TreeNode)`
  padding: 16px 0;
`;

// ツリー全体のスタイル
const StyledTree = styled(Tree)`
  padding: 20px;
  
  /* 木の各レベルの間隔を調整 */
  & > div {
    padding-top: 20px;
  }
`;

// 組織ノードコンポーネント
const OrganizationNode = ({ organization, onAddChild, onDeleteOrg, readOnly }) => {
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  return (
    <StyledNode
      onMouseEnter={() => !readOnly && setShowDeleteButton(true)}
      onMouseLeave={() => setShowDeleteButton(false)}
    >
      <div className="font-bold text-brand-darkBlue truncate">{organization.name}</div>
      <div className="text-xs text-brand-darkBlue mt-1">組織コード {organization.code}</div>
      
      {!readOnly && showDeleteButton && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDeleteOrg(organization);
          }}
          className="absolute -top-2 -right-2 bg-white text-red-500 hover:text-red-700 w-5 h-5 rounded-full border border-red-500 flex items-center justify-center shadow-sm"
          title="組織を削除"
        >
          ×
        </button>
      )}
      
      {!readOnly && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAddChild(organization);
          }}
          className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white text-gray-600 hover:text-brand-darkBlue w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center shadow-sm z-10"
        >
          +
        </button>
      )}
    </StyledNode>
  );
};

// 再帰的にツリーノードを構築する関数
const renderTreeNodes = (organization, onAddChild, onDeleteOrg, readOnly) => {
  return (
    <StyledTreeNode 
      key={organization.id} 
      label={
        <OrganizationNode 
          organization={organization} 
          onAddChild={onAddChild} 
          onDeleteOrg={onDeleteOrg}
          readOnly={readOnly} 
        />
      }
    >
      {organization.children && organization.children.map(child => (
        renderTreeNodes(child, onAddChild, onDeleteOrg, readOnly)
      ))}
    </StyledTreeNode>
  );
};

// メインの組織図コンポーネント
const OrganizationChart = ({ organizations, onAddChild, onDeleteOrg, readOnly = false }) => {
  return (
    <div className="min-w-max flex justify-center">
      {organizations.length === 1 ? (
        // 単一の組織ツリーの場合
        <StyledTree 
          lineWidth={'2px'}
          lineColor={'#9ca3af'}
          lineBorderRadius={'10px'}
          label={<div style={{ width: 0, height: 0 }}></div>}
        >
          {renderTreeNodes(organizations[0], onAddChild, onDeleteOrg, readOnly)}
        </StyledTree>
      ) : (
        // 複数のルート組織がある場合、それぞれを横に並べる
        <div className="flex flex-wrap justify-center gap-12 p-10">
          {organizations.map(org => (
            <div key={org.id} className="min-w-max">
              <StyledTree 
                lineWidth={'2px'}
                lineColor={'#9ca3af'}
                lineBorderRadius={'10px'}
                label={<div style={{ width: 0, height: 0 }}></div>}
              >
                {renderTreeNodes(org, onAddChild, onDeleteOrg, readOnly)}
              </StyledTree>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizationChart;