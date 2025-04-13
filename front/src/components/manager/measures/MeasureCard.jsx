import React, { useState, useEffect, useMemo } from 'react';
import { CSSTransition } from 'react-transition-group';
import AIOrangeTextTooltip from './AIOrangeTextTooltip';

const MeasureCard = ({
  currentMeasure,
  currentMeasureIndex,
  totalMeasures,
  updateMeasure,
  setShowAssigneeModal,
  assigneeList,
  slideDirection,
  isAIGenerated, // AI生成フラグ
}) => {
  // 入力フィールドの編集状態を管理
  const [fieldEdited, setFieldEdited] = useState({
    shisaku: false,
    actionPlan: false,
    actionPlanDetail: false
  });
  
  // AIテキスト説明吹き出しの表示
  const [showOrangeTextTooltip, setShowOrangeTextTooltip] = useState(false);

  // AI生成テキストがある場合に吹き出しを表示
  useEffect(() => {
    if (isAIGenerated) {
      setShowOrangeTextTooltip(true);
      // 自動非表示は削除し、ユーザーが×ボタンで閉じるまで表示し続ける
    }
  }, [isAIGenerated]);

  // 吹き出しを閉じる処理
  const handleCloseTooltip = () => {
    setShowOrangeTextTooltip(false);
  };

  // 入力ハンドラー（編集フラグをセット）
  const handleInputChange = (field, value) => {
    updateMeasure(field, value);
    setFieldEdited(prev => ({ ...prev, [field]: true }));
  };

  // テキストの色を判定するヘルパー関数
  const getTextColor = (field) => {
    if (!isAIGenerated) return 'text-brand-darkBlue';
    return fieldEdited[field] ? 'text-brand-darkBlue' : 'text-brand-orange';
  };

  // 施策情報から自動的にタグ情報を生成
  const measureTags = useMemo(() => {
    const tags = [];
    
    // 期限からの目安期間推定
    const dueDate = new Date(currentMeasure.dueDate);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      tags.push({ type: 'timeframe', label: '即時（1週間以内）', color: 'bg-brand-coral' });
    } else if (diffDays <= 90) {
      tags.push({ type: 'timeframe', label: '短期（1-3ヶ月）', color: 'bg-brand-orange' });
    } else if (diffDays <= 180) {
      tags.push({ type: 'timeframe', label: '中期（3-6ヶ月）', color: 'bg-brand-teal' });
    } else {
      tags.push({ type: 'timeframe', label: '長期（6ヶ月以上）', color: 'bg-brand-darkBlue' });
    }
    
    // アクションプランの内容から実装の複雑さを推定
    // 文章の長さやキーワードに基づいて複雑さを推定
    const complexityKeywords = ['複雑', '高度', '大規模', '全社的', '構造改革', '連携', '多部署'];
    const simpleKeywords = ['シンプル', '小規模', '部分的', 'ミーティング', '共有', '単独'];
    
    const allText = (currentMeasure.shisaku || '') + ' ' + 
                    (currentMeasure.actionPlan || '') + ' ' + 
                    (currentMeasure.actionPlanDetail || '');
    
    let complexCount = 0;
    let simpleCount = 0;
    
    complexityKeywords.forEach(keyword => {
      if (allText.includes(keyword)) complexCount++;
    });
    
    simpleKeywords.forEach(keyword => {
      if (allText.includes(keyword)) simpleCount++;
    });
    
    if (complexCount > simpleCount || currentMeasure.actionPlanDetail?.length > 200) {
      tags.push({ type: 'complexity', label: '実装工数：大', color: 'bg-brand-teal' });
    } else if (complexCount === simpleCount || 
              (currentMeasure.actionPlanDetail?.length > 100 && currentMeasure.actionPlanDetail?.length <= 200)) {
      tags.push({ type: 'complexity', label: '実装工数：中', color: 'bg-brand-cyan' });
    } else {
      tags.push({ type: 'complexity', label: '実装工数：小', color: 'bg-brand-coral' });
    }
    
    // 必要人員の推定
    // アクションプランの内容から必要人員を推定
    const largeTeamKeywords = ['チーム全体', '部門間', '全社', '大規模', '組織改革'];
    const mediumTeamKeywords = ['複数人', 'チーム', 'グループ', '部門内'];
    const smallTeamKeywords = ['個人', '一人', '担当者', '単独'];
    
    let largeCount = 0;
    let mediumCount = 0;
    let smallCount = 0;
    
    largeTeamKeywords.forEach(keyword => {
      if (allText.includes(keyword)) largeCount++;
    });
    
    mediumTeamKeywords.forEach(keyword => {
      if (allText.includes(keyword)) mediumCount++;
    });
    
    smallTeamKeywords.forEach(keyword => {
      if (allText.includes(keyword)) smallCount++;
    });
    
    // 最も多いカウントに基づいて人員タグを追加
    if (largeCount >= mediumCount && largeCount >= smallCount) {
      tags.push({ type: 'resources', label: '必要人員：30%以上', color: 'bg-brand-cyan' });
    } else if (mediumCount >= largeCount && mediumCount >= smallCount) {
      tags.push({ type: 'resources', label: '必要人員：15-30%', color: 'bg-brand-cyan' });
    } else {
      tags.push({ type: 'resources', label: '必要人員：15%未満', color: 'bg-brand-cyan' });
    }
    
    return tags;
  }, [currentMeasure]);

  return (
    <CSSTransition
      in={true}
      appear={true}
      timeout={300}
      classNames={`card-slide-${slideDirection}`}
      key={currentMeasureIndex}
    >
      <div className="bg-brand-lightGray rounded-lg shadow-md p-6 transition-all mx-10 relative">
        {/* AIテキスト説明吹き出し */}
        {showOrangeTextTooltip && <AIOrangeTextTooltip onClose={handleCloseTooltip} />}
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg text-brand-darkBlue">
              施策 {currentMeasureIndex + 1}/{totalMeasures}
            </span>
            
            {/* 自動生成されたタグ表示エリア - 施策番号の右に配置、施策1では非表示 */}
            {measureTags.length > 0 && currentMeasureIndex > 0 && (
              <div className="flex flex-wrap gap-2">
                {measureTags.map((tag, index) => (
                  <span 
                    key={index}
                    className={`px-3 py-1 rounded-md text-white text-xs font-medium inline-flex items-center ${tag.color}`}
                    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                  >
                    <span className="mr-1">●</span> {tag.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <hr className="my-4 h-px border-4 border-brand-teal" />

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">施策案</label>
          <input
            type="text"
            className={`border border-brand-darkBlue rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-brand-cyan ${getTextColor('shisaku')}`}
            placeholder="例）定期的に意見共有の場を設ける"
            value={currentMeasure.shisaku}
            onChange={(e) => handleInputChange('shisaku', e.target.value)}
          />
        </div>



        <div className="mb-4">
          <div className="flex w-full">
            <div className="w-full">
              <label className="block text-sm font-medium mb-1">
                アクションプラン
              </label>
              <input
                type="text"
                className={`border border-brand-darkBlue rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-brand-cyan ${getTextColor('actionPlan')}`}
                placeholder="例）月1回のワークショップを開催"
                value={currentMeasure.actionPlan}
                onChange={(e) => handleInputChange('actionPlan', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <div className="flex justify-between w-1/2">
              <label className="block text-sm font-medium mb-1">
                担当者
              </label>
              <button
                onClick={() => setShowAssigneeModal(true)}
                className="text-brand-cyan hover:text-brand-teal flex items-center whitespace-nowrap text-sm font-medium"
              >
                <svg
                  width="16"
                  height="16"
                  className="mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5V19M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                追加
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="border border-brand-darkBlue rounded px-3 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                value={currentMeasure.assignee}
                onChange={(e) => updateMeasure('assignee', e.target.value)}
              >
                <option value="">-- 担当者を選択 --</option>
                {assigneeList.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">期限</label>
            <input
              type="date"
              className="border w-1/2 border-brand-darkBlue rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan"
              value={currentMeasure.dueDate}
              onChange={(e) => updateMeasure('dueDate', e.target.value)}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            アクションプランの詳細
          </label>
          <textarea
            className={`border border-brand-darkBlue w-full h-24 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-cyan ${getTextColor('actionPlanDetail')}`}
            placeholder="アクションプランの詳細を記入"
            value={currentMeasure.actionPlanDetail}
            onChange={(e) => handleInputChange('actionPlanDetail', e.target.value)}
          />
        </div>
      </div>
    </CSSTransition>
  );
};

export default MeasureCard;