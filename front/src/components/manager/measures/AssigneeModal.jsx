import React from 'react';

const AssigneeModal = ({ 
  newAssignee, 
  setNewAssignee, 
  handleAddAssignee, 
  onClose 
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-brand-darkBlue">
          担当者を追加
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          新しい担当者名
        </label>
        <input
          type="text"
          className="border border-brand-darkBlue rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-brand-cyan"
          placeholder="担当者名を入力"
          value={newAssignee}
          onChange={(e) => setNewAssignee(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-brand-darkBlue text-brand-darkBlue rounded hover:bg-brand-lightGray"
        >
          キャンセル
        </button>
        <button
          onClick={() => {
            if (newAssignee.trim()) {
              handleAddAssignee();
              onClose();
            }
          }}
          className="px-4 py-2 bg-brand-cyan text-white rounded hover:bg-brand-teal"
          disabled={!newAssignee.trim()}
        >
          追加
        </button>
      </div>
    </div>
  </div>
);

export default AssigneeModal;