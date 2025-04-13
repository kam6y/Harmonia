import React from 'react';

const CurrentMeasureDisplay = ({ measure }) => (
  <div className="mb-6 bg-brand-lightGray p-4 rounded">
    <p className="text-sm font-medium mb-1">選択中の施策</p>
    <div className="bg-white rounded-lg shadow-md p-6 mt-2">
      <div className="flex">
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              施策案
            </label>
            <p className="font-semibold">{measure.shisaku}</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              アクションプラン
            </label>
            <p className="font-semibold">{measure.actionPlan}</p>
          </div>
        </div>
        {/* ここに目標値入力部分が入る (Step3Contentで実装) */}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            担当者
          </label>
          <p className="font-semibold">{measure.assignee}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            期限
          </label>
          <p className="font-semibold">{measure.dueDate}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">
          アクションプラン詳細
        </label>
        <p className="text-sm">{measure.actionPlanDetail}</p>
      </div>
    </div>
  </div>
);

export default CurrentMeasureDisplay;
