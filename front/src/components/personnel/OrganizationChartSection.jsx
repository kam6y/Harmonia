import React from 'react';
import styled from 'styled-components';
import { Tree, TreeNode } from 'react-organizational-chart';

const StyledNode = styled.div`
  padding: 16px;
  border-radius: 8px;
  background-color: #f1f4f5;
  border: 1px solid #e2e8f0;
  display: inline-block;
  width: 240px;
  position: relative;
  margin: 0 auto;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
`;

const StyledTreeNode = styled(TreeNode)`
  padding: 16px 0;
`;

const StyledTree = styled(Tree)`
  padding: 20px;
  
  /* 木の各レベルの間隔を調整 */
  & > div {
    padding-top: 20px;
  }
`;

const Divider = styled.hr`
  border: 0;
  height: 1px;
  background-color: #e2e8f0;
  margin: 12px 0;
`;

const DepartmentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DepartmentName = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #004259;
`;

const DepartmentCode = styled.div`
  font-size: 14px;
  color: #004259;
`;

const StatsContainer = styled.div`
  text-align: center;
`;

const ScoreText = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.color};
  margin-bottom: 4px;
`;

const StatText = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
`;

const OrganizationChartSection = ({ organizations, onOrganizationClick }) => {
    // 組織カードコンポーネント
    const OrganizationNode = ({ organization, onClick }) => {
        // APIから取得した統計情報（statsが存在しない場合はデフォルト値を設定）
        const stats = organization.stats || {
            totalMeasures: 0,
            avgScore: 0,
            responseRate: 0
        };

        // avgScoreがundefinedの場合に備えた安全な値の取得
        const avgScore = (stats.avgScore !== undefined && typeof stats.avgScore === 'number')
            ? stats.avgScore
            : 0;

        // スコアに基づく色の設定
        let scoreColor = "#F29759"; // デフォルトはオレンジ（3.0-4.0）
        if (avgScore >= 4) {
            scoreColor = "#00A3B3"; // 良いスコアは緑/ティール
        } else if (avgScore < 3) {
            scoreColor = "#FC7F7A"; // 低いスコアは赤/コーラル
        }

        return (
            <StyledNode onClick={() => onClick(organization.id)}>
                <DepartmentHeader>
                    <DepartmentName>{organization.name}</DepartmentName>
                    <DepartmentCode>コード: {organization.code}</DepartmentCode>
                </DepartmentHeader>

                <Divider />

                <StatsContainer>
                    <ScoreText color={scoreColor}>
                        スコア: {avgScore.toFixed(1)}
                    </ScoreText>
                    <StatText>
                        施策数: {stats.totalMeasures}
                    </StatText>
                    <StatText>
                        回答率: {stats.responseRate || 0}%
                    </StatText>
                </StatsContainer>
            </StyledNode>
        );
    };

    // 再帰的にツリーノードを構築する関数
    const renderTreeNodes = (organization) => {
        return (
            <StyledTreeNode
                key={organization.id}
                label={
                    <OrganizationNode
                        organization={organization}
                        onClick={onOrganizationClick}
                    />
                }
            >
                {organization.children && organization.children.map(child => (
                    renderTreeNodes(child)
                ))}
            </StyledTreeNode>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
            <div className="min-w-max flex justify-center">
                {organizations && organizations.length > 0 ? (
                    organizations.map(org => (
                        <div key={org.id} className="min-w-max">
                            <StyledTree
                                lineWidth={'2px'}
                                lineColor={'#9ca3af'}
                                lineBorderRadius={'10px'}
                                label={<div style={{ width: 0, height: 0 }}></div>}
                            >
                                {renderTreeNodes(org)}
                            </StyledTree>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        組織データがありません
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrganizationChartSection;
