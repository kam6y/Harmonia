// components/personnel/ResponseRateComponent.jsx
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';

// OrganizationChartコンポーネントをダイナミックインポート（SSRを無効に）
const OrganizationChart = dynamic(
  () => import('react-organizational-chart').then(mod => mod.Tree),
  { ssr: false }
);

const TreeNode = dynamic(
  () => import('react-organizational-chart').then(mod => mod.TreeNode),
  { ssr: false }
);

// メインコンテナ
const ChartContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 24px;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ChartTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

// カードグリッドコンテナ
const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

// 回答率の低い部署カード
const DepartmentCard = styled.div`
  padding: 12px 16px;
  border-radius: 6px;
  background-color: ${props => 
    props.rate < 30 ? '#fff1f0' : 
    props.rate < 50 ? '#fff7e6' : 
    props.rate < 70 ? '#fffbe6' : 
    '#f6ffed'};
  color: #333;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  /* 9:16の比率 */
  height: 90px;
  position: relative;
  border: 1px solid #d1d5db;
  border-left: 4px solid ${props => 
    props.rate < 30 ? '#ff4d4f' : 
    props.rate < 50 ? '#ff7a45' : 
    props.rate < 70 ? '#ffc53d' : 
    '#52c41a'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const DepartmentName = styled.div`
  font-weight: 500;
  font-size: 15px;
`;

const ResponseRate = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => 
    props.rate < 100 ? '#000000' : 
    '#000000'};
`;

// 警告メッセージ
const WarningMessage = styled.div`
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  padding: 8px 12px;
  color: #ff4d4f;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
  }
`;

// トグルボタン
const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #1890ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  padding: 4px 8px;
  
  &:hover {
    text-decoration: underline;
  }
`;

// セクション区切り
const SectionDivider = styled.div`
  height: 1px;
  background-color: #f0f0f0;
  margin: 20px 0;
`;

// 組織図のノードスタイル
const StyledNode = styled.div`
  padding: 12px 16px;
  border-radius: 6px;
  display: inline-block;
  border: 1px solid #d1d5db;
  background-color: ${props => 
    props.rate < 30 ? '#fff1f0' : 
    props.rate < 50 ? '#fff7e6' : 
    props.rate < 70 ? '#fffbe6' : 
    '#f6ffed'};
  border-left: 4px solid ${props => 
    props.rate < 30 ? '#ff4d4f' : 
    props.rate < 50 ? '#ff7a45' : 
    props.rate < 70 ? '#ffc53d' : 
    '#52c41a'};
  min-width: 160px;
`;

const NodeTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
`;

const NodeRate = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${props => 
    props.rate < 30 ? '#ff4d4f' : 
    props.rate < 50 ? '#ff7a45' : 
    props.rate < 70 ? '#ffc53d' : 
    '#52c41a'};
`;

// 組織ノードコンポーネント
const OrganizationNode = ({ org }) => (
  <StyledNode rate={org.rate}>
    <NodeTitle>{org.name}</NodeTitle>
    <NodeRate rate={org.rate}>{org.rate}%</NodeRate>
  </StyledNode>
);

// 再帰的にツリーノードを構築する関数
const renderTreeNodes = (data) => {
  return (
    <TreeNode 
      key={data.id} 
      label={<OrganizationNode org={data} />}
    >
      {data.children && data.children.map(child => renderTreeNodes(child))}
    </TreeNode>
  );
};

// プロップス型の変更: lowRateDepartmentsとfullOrgDataを受け取るように
const ResponseRateComponent = ({ lowRateDepartments, fullOrgData }) => {
  // チャート表示/非表示の状態
  const [showChart, setShowChart] = useState(false);

  return (
    <>
      <h2 className="text-xl font-bold text-brand-darkBlue mb-4">組織ごとの回答率</h2>
      
      <ChartContainer>
        {/* 回答率が低下している部署セクション */}
        <h3 className="text-lg font-semibold text-gray-800 mb-3">回答率が低下している部署</h3>
        
        <WarningMessage>
          <svg viewBox="64 64 896 896" focusable="false" data-icon="exclamation-circle" width="14" height="14" fill="currentColor" aria-hidden="true">
            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
            <path d="M464 688a48 48 0 1096 0 48 48 0 10-96 0zm24-112h48c4.4 0 8-3.6 8-8V296c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8z"></path>
          </svg>
          これらの部署は、解答率が基準より低下しているため、改善の必要があります。
        </WarningMessage>
      
      <CardGrid>
        {lowRateDepartments.map(dept => (
          <DepartmentCard key={dept.id} rate={dept.rate}>
            <DepartmentName>{dept.name}</DepartmentName>
            <ResponseRate rate={dept.rate}>{dept.rate}%</ResponseRate>
          </DepartmentCard>
        ))}
      </CardGrid>
      
      <SectionDivider />
      
      {/* 組織別回答率チャートセクション - 開閉可能 */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">組織別回答率チャート</h3>
        <ToggleButton onClick={() => setShowChart(!showChart)}>
          {showChart ? '折りたたむ ▲' : '展開する ▼'}
        </ToggleButton>
      </div>
      
      {showChart && (
        <div className="mt-4 pb-4 overflow-x-auto" style={{ minHeight: '600px' }}>
          <OrganizationChart
            lineWidth="1px"
            lineColor="#d9d9d9"
            lineHeight="20px"
            nodePadding="5px"
          >
            {renderTreeNodes(fullOrgData)}
          </OrganizationChart>
        </div>
      )}
    </ChartContainer>
    </>
  );
};

export default ResponseRateComponent;