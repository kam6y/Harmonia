// components/personnel/HierarchicalResponseChart.jsx
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

// スタイル付きコンポーネント
const ChartContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 24px;
  overflow-x: auto;
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

// 組織ノードのスタイル
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

const SelectContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const SelectLabel = styled.label`
  margin-right: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const StyledSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background-color: white;
  cursor: pointer;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: #40a9ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
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

const HierarchicalResponseChart = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  
  // 回答率が低い部署のデータ
  const lowRateOrgData = {
    id: 'root',
    name: '会社全体',
    rate: 65,
    children: [
      {
        id: 'sales',
        name: '営業部',
        rate: 55,
        children: [
          { id: 'sales-div', name: '営業部営業課', rate: 10 }
        ]
      },
      {
        id: 'dev',
        name: '開発部',
        rate: 60,
        children: [
          { id: 'dev-div', name: '開発部開発課', rate: 30 }
        ]
      },
      {
        id: 'org',
        name: '組織マネジメント部',
        rate: 45,
        children: []
      },
      {
        id: 'fruit',
        name: 'フルーツジッパー',
        rate: 40,
        children: []
      }
    ]
  };

  // 会社全体の組織図データ
  const fullOrgData = {
    id: 'root',
    name: '会社全体',
    rate: 65,
    children: [
      {
        id: 'admin',
        name: '管理本部',
        rate: 80,
        children: [
          { id: 'hr', name: '人事部', rate: 60, 
            children: [
              { id: 'hr-div', name: '人事課', rate: 60 }
            ] 
          },
          { id: 'acc', name: '経理部', rate: 71,
            children: [
              { id: 'acc-div', name: '経理課', rate: 71 }
            ]
          },
          { id: 'gen', name: '総務部', rate: 75, 
            children: [
              { id: 'gen-div', name: '総務課', rate: 65 },
              { id: 'risk', name: 'リスク管理課', rate: 90 }
            ] 
          },
          { id: 'it', name: '情報システム部', rate: 80 }
        ]
      },
      {
        id: 'sales',
        name: '営業部',
        rate: 80,
        children: [
          { id: 'sales-hr', name: '人事部', rate: 60, 
            children: [
              { id: 'sales-hr-div', name: '人事課', rate: 60 }
            ] 
          },
          { id: 'sales-acc', name: '経理部', rate: 21,
            children: [
              { id: 'sales-acc-div', name: '経理課', rate: 21 }
            ]
          },
          { id: 'sales-gen', name: '総務部', rate: 75, 
            children: [
              { id: 'sales-gen-div', name: '総務課', rate: 65 },
              { id: 'sales-risk', name: 'リスク管理課', rate: 90 }
            ] 
          },
          { id: 'sales-it', name: '情報システム部', rate: 80 }
        ]
      },
      {
        id: 'creative',
        name: '創造部',
        rate: 80,
        children: [
          { id: 'creative-hr', name: '人事部', rate: 60 },
          { id: 'creative-acc', name: '経理部', rate: 71 },
          { id: 'creative-gen', name: '総務部', rate: 75 },
          { id: 'creative-it', name: '情報システム部', rate: 80 }
        ]
      },
      {
        id: 'dev',
        name: '開発部',
        rate: 80,
        children: [
          { id: 'dev-hr', name: '人事部', rate: 60 },
          { id: 'dev-acc', name: '経理部', rate: 71 },
          { id: 'dev-gen', name: '総務部', rate: 75 },
          { id: 'dev-it', name: '情報システム部', rate: 80 }
        ]
      }
    ]
  };

  // 部署データ用のオブジェクト
  const departmentData = {
    'all': fullOrgData,
    'admin': fullOrgData.children.find(d => d.id === 'admin'),
    'sales': fullOrgData.children.find(d => d.id === 'sales'),
    'creative': fullOrgData.children.find(d => d.id === 'creative'),
    'dev': fullOrgData.children.find(d => d.id === 'dev')
  };

  // 表示するデータを取得
  const displayData = selectedDepartment === 'all' 
    ? departmentData.all
    : departmentData[selectedDepartment];

  return (
    <ChartContainer>
      <ChartHeader>
        <ChartTitle>組織別回答率チャート</ChartTitle>
      </ChartHeader>
      
      <SelectContainer>
        <SelectLabel>表示する部署:</SelectLabel>
        <StyledSelect 
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          <option value="all">全組織</option>
          <option value="admin">管理本部</option>
          <option value="sales">営業部</option>
          <option value="creative">創造部</option>
          <option value="dev">開発部</option>
        </StyledSelect>
      </SelectContainer>
      
      <div className="mt-6 pb-4 overflow-x-auto" style={{ minHeight: '600px' }}>
        <OrganizationChart
          lineWidth="1px"
          lineColor="#d9d9d9"
          lineHeight="20px"
          nodePadding="5px"
        >
          {renderTreeNodes(displayData)}
        </OrganizationChart>
      </div>
    </ChartContainer>
  );
};

export default HierarchicalResponseChart;